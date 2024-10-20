import { AppLifecycleV1, CoreApplicationV1 } from "../subsystems";
import { Message, RawMessage, Subsystem } from "../types";

import { LaunchActivatedEventArgs } from "../ApplicationModel/Activation/LaunchActivatedEventArgs";
import { isHosted } from "../helpers";

/**
 * Represents the application
 */
export class CoreApplication extends EventTarget {
    /**
     * @internal
     */
    private static _instance: CoreApplication | null = null;

    public static get current(): CoreApplication | null {
        return CoreApplication._instance;
    }

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

        console.log("Initializing CoreApplication");

        CoreApplication._instance = new CoreApplication();
        await CoreApplication._instance.initializeAsync();

        return CoreApplication._instance;
    }

    /**
     * @internal
     */
    private callbackId: number = 0;
    /**
     * @internal
     */
    private callbackMap: Map<number, (msg: Message) => any> = new Map();
    /**
     * @internal
     */
    private _port: MessagePort | null = null;

    /**
     * @internal
     */
    constructor() {
        super();

        if (CoreApplication._instance) {
            throw new Error("CoreApplication is a singleton class and cannot be instantiated more than once.");
        }

        this.handleMessage = this.handleMessage.bind(this);
    }

    /**
     * Starts the application
     */
    public run(): void {
        this.sendMessage({ type: CoreApplicationV1, data: { type: "initialized" } });
    }

    /**
     * @internal
     */
    private async initializeAsync(): Promise<void> {
        if (!isHosted())
            return;

        window.addEventListener("message", this.handleMessage);
        await new Promise<void>((resolve) => {
            this.addEventListener("initialized", () => {
                resolve();
            });
        });
    }

    /**
     * @internal
     */
    private async onMessage(e: Message) {
        switch (e.type) {
            case AppLifecycleV1:
                switch (e.data.type) {
                    case "activated": {
                        let event = new CustomEvent<LaunchActivatedEventArgs>("activated", { detail: new LaunchActivatedEventArgs(e.data.kind) });
                        this.dispatchEvent(event);
                        break;
                    }
                }
                break;
        }
    }

    /**
     * @internal
     */
    public async sendMessage<S = any, R = any>(msg: RawMessage<S>): Promise<Message<R>> {
        return new Promise((resolve, reject) => {
            const channel = this.registerCallback((msg) => {
                if (msg.errored) {
                    reject(msg.data);
                }
                else {
                    resolve(msg);
                }
            });

            this._port.postMessage({
                type: msg.type,
                channel: msg.replyChannel ?? channel,
                replyChannel: channel,
                data: msg.data,
                errored: false
            });
        });
    }

    /**
     * @internal
     */
    public async postMessage<S = any>(msg: RawMessage<S>): Promise<void> {
        // console.debug(`${this.name}:client sending message %s:%d, %O`, this.name, msg.nType, msg);

        this._port.postMessage({
            type: msg.type,
            channel: msg.channel,
            replyChannel: msg.replyChannel,
            data: msg.data,
            errored: (msg as any).errored ?? false
        });
    }

    public async replyMessage<S = any>(msg: Message, data: S, errored: boolean = false): Promise<void> {
        // console.debug(`${this.name}:client sending message %s:%d, %O`, this.name, msg.nType, msg);

        this._port.postMessage({
            type: msg.type,
            channel: msg.replyChannel,
            replyChannel: msg.channel,
            data: data,
            errored: errored
        });
    }

    /**
     * @internal
     */
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

    /**
     * @internal
     */
    public getCallback(id: number): ((msg: Message) => void) | undefined {
        return this.callbackMap.get(id);
    }

    /**
     * @internal
     */
    public async handleMessage(e: MessageEvent): Promise<void> {
        const msg = e.data as Message;
        console.log(`client recieved message %s:%d %O`, msg.type, msg.channel, msg);

        if (msg.type === CoreApplicationV1 && msg.data.type === "initialized") {
            window.removeEventListener("message", this.handleMessage);

            this._port = e.ports[0];
            this._port.onmessage = this.handleMessage;

            this.dispatchEvent(new CustomEvent("initialized"));
            return;
        }

        const callback = msg.channel && this.callbackMap.get(msg.channel);
        if (callback) {
            try {
                let ret = await callback(msg);
                if (msg.replyChannel) {
                    await this.postMessage({ type: msg.type, channel: msg.replyChannel, data: ret });
                }
            }
            catch (e) {
                if (msg.replyChannel) {
                    await this.postMessage({ type: msg.type, channel: msg.replyChannel, data: e, errored: true } as Message);
                }
            }
        } else {
            let ret = await this.onMessage(msg);
            if (msg.replyChannel) {
                await this.postMessage({ type: msg.type, channel: msg.replyChannel, data: ret });
            }
        }
    }
}
