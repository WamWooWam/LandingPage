import { Message, RawMessage, Subsystem } from "../types";

import { isHosted } from "../helpers";

/**
 * Represents the application
 */
export class CoreApplication extends EventTarget {
    /**
     * @internal
     */
    private static _instance: CoreApplication | null = null;

    /**
     * Initializes the CoreApplication instance if the app is hosted, otherwise returns null
     * 
     * @async
     * @returns The CoreApplication instance if the app is hosted, otherwise null
     */
    public static async initializeAsync(): Promise<CoreApplication | null> {
        if (!isHosted()) {
            return null;
        }

        CoreApplication._instance = new CoreApplication();
        await CoreApplication._instance.initializeAsync();

        return CoreApplication._instance;
    }

    /**
     * @internal
     */
    private subsystems = new Map<number, SubsystemClass>();

    /**
     * @internal
     */
    constructor() {
        super();

        if (CoreApplication._instance) {
            throw new Error("CoreApplication is a singleton class and cannot be instantiated more than once.");
        }

        this.onMessage = this.onMessage.bind(this);
    }

    /**
     * Starts the application
     */
    public run(): void {
        
    }

    /**
     * @internal
     */
    public registerSubsystem(subsystem: number, handler: (message: Omit<Message, "subsystem">) => void): Subsystem {
        const sub = new SubsystemClass(subsystem, handler);
        this.subsystems.set(subsystem, sub);
        return sub;
    }

    /**
     * @internal
     */
    private async initializeAsync(): Promise<void> {
        this.addEventListener("message", this.onMessage);
    }

    /**
     * @internal
     */
    private onMessage(event: MessageEvent): void {
        const message = event.data as Message;
        const subsystem = this.subsystems.get(message.subsystem);
        if (subsystem) {
            subsystem.handleMessage(message);
        }
    }
}

class SubsystemClass implements Subsystem {
    public readonly id: number;

    private handler: (msg: RawMessage<any>) => void;
    private callbackMap = new Map<number, (msg: Message) => any | Promise<any>>();
    private callbackId = 0x4000;

    constructor(id: number, handler: (msg: RawMessage<any>) => void) {
        this.id = id;
        this.handler = handler;
        window.addEventListener('message', (event) => this.handleMessage(event.data as Message));
    }

    public async sendMessage<S = any, R = any>(msg: RawMessage<S>): Promise<Message<R>> {
        // console.debug(`${this.name}:client sending message %s:%d, %O`, this.name, msg.nType, msg);

        return new Promise((resolve, reject) => {
            const channel = this.registerCallback((msg) => {
                if (msg.type & 0x80000000) {
                    reject(msg.data);
                }
                else {
                    resolve(msg);
                }
            });

            window.postMessage({
                lpSubsystem: this.id,
                nType: msg.type,
                nChannel: msg.replyChannel ?? channel,
                nReplyChannel: channel,
                data: msg.data
            });
        });
    }

    public async postMessage<S = any>(msg: RawMessage<S>): Promise<void> {
        // console.debug(`${this.name}:client sending message %s:%d, %O`, this.name, msg.nType, msg);

        window.postMessage({
            subsystem: this.id,
            type: msg.type,
            channel: msg.channel,
            replyChannel: msg.replyChannel,
            data: msg.data
        });
    }

    public registerCallback(callback: (msg: Message) => any | Promise<any>, persist: boolean = false): number {
        const id = this.callbackId++;
        const handler = async (msg: Message) => {
            if (!persist)
                this.callbackMap.delete(id);
            return await callback(msg);
        };

        this.callbackMap.set(id, handler);
        return id;
    }

    public getCallback(id: number): ((msg: Message) => void) | undefined {
        return this.callbackMap.get(id);
    }

    /**
     * @internal
     */
    public async handleMessage(msg: Message): Promise<void> {
        if (msg.subsystem !== this.id) return;

        // console.log(`${this.name}:client recieved message %s:%d -> %d, %O`, msg.lpSubsystem, msg.nType, msg.nChannel, msg);

        const callback = msg.channel && this.callbackMap.get(msg.channel);
        if (callback) {
            let ret = await callback(msg);
            if (msg.replyChannel) {
                await this.postMessage({ type: msg.type, channel: msg.replyChannel, data: ret });
            }
        } else {
            return this.handler(msg);
        }
    }
}