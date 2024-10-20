import { ActivatedDeferralV1, ActivationKind, AppLifecycleV1, CoreApplicationV1, Message } from "@landing-page/api";
import { Position, Size, newGuid } from "../Util";

import CoreApplication from "./CoreApplication";
import CoreWindowEvent from "../Events/CoreWindowEvent";
import CoreWindowLayoutManager from "./CoreWindowLayoutManager";
import CoreWindowManager from "./CoreWindowManager";
import CoreWindowState from "./CoreWindowState";
import Events from "../Events";
import { Package } from "shared/Package";
import { PackageApplication } from "shared/PackageApplication";
import { Signal } from "@preact/signals";
import { ensureCapabilitiesAsync } from "./PackageCapabilities";

class CoreWindowSignals {
    title: Signal<string>;
    isVisible: Signal<boolean>;

    constructor() {
        this.title = new Signal<string>();
        this.isVisible = new Signal<boolean>();
    }
}

// TODO: investigate using signals instead of events
export default class CoreWindow {
    error: Error | null;

    private _id: string
    private _instance: CoreApplication
    private _view: HTMLIFrameElement
    private _state: CoreWindowState;
    private _size: Size;
    private _position: Position;
    private _signals: CoreWindowSignals = new CoreWindowSignals();
    private _messageChannel: MessageChannel;

    private _callbackMap = new Map<number, (msg: Message) => any | Promise<any>>();
    private _callbackId = 0x7FFFFFFF;

    private _deferralId: string = null;

    constructor(instance: CoreApplication) {
        this._id = `CoreWindow_${newGuid()}`
        this._instance = instance
        this._state = CoreWindowState.uninitialized;
        this._size = { width: 0, height: 0 };
        this._position = { x: 0, y: 0 };
        this._view = document.createElement("iframe");
        this._view.id = this._id;

        this._messageChannel = new MessageChannel();
        this._messageChannel.port2.addEventListener("message", this.handleMessage);
        this._messageChannel.port2.start();

        this.signals.title.value = "";
        this.signals.isVisible.value = false;

        this.handleMessage = this.handleMessage.bind(this);
        this.onLoaded = this.onLoaded.bind(this);
    }

    get signals(): CoreWindowSignals {
        return this._signals;
    }

    get id(): string {
        return this._id;
    }

    get package(): Package {
        return this._instance.package;
    }

    get packageApplication(): PackageApplication {
        return this._instance.packageApplication;
    }

    get instance(): CoreApplication {
        return this._instance;
    }

    get view(): HTMLElement {
        return this._view;
    }

    get title(): string {
        return this.signals.title.value;
    }

    set title(newTitle: string) {
        this.signals.title.value = newTitle;
    }

    get size(): Size {
        return this._size;
    }

    set size(newSize: Size) {
        this._size = newSize;
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-bounds-changed", this));
    }

    get position(): Position {
        return this._position;
    }

    set position(newPosition: Position) {
        this._position = newPosition;
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-bounds-changed", this));
    }

    get visible(): boolean {
        return this.signals.isVisible.value;
    }

    set visible(newVisible: boolean) {
        this.signals.isVisible.value = newVisible;
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-visibility-changed", this));
    }

    get state(): CoreWindowState {
        return this._state;
    }

    set state(newState: CoreWindowState) {
        if (this._state == newState) return;

        this._state = newState;
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-state-changed", this));
    }

    get left(): number {
        return this._position.x;
    }

    get top(): number {
        return this._position.y;
    }

    get right(): number {
        return this._position.x + this._size.width;
    }

    get bottom(): number {
        return this._position.y + this._size.height;
    }

    get width(): number {
        return this._size.width;
    }

    get height(): number {
        return this._size.height;
    }

    async load(): Promise<void> {
        if (this.state != CoreWindowState.uninitialized) return;
        this.state = CoreWindowState.loading;
        await ensureCapabilitiesAsync(this.package);

        try {
            let app = this.packageApplication;
            let entryPoint = app.entryPoint;
            if (!entryPoint) {
                throw new Error("No entry point defined for package application");
            }

            this._view.src = entryPoint;
            this._view.addEventListener("load", this.onLoaded);

            if (entryPoint.startsWith("https")) {
                // for now we're assuming that if the site isn't loaded relative to the current site, it doesn't use the CoreApplication lifecycle events
                this.state = CoreWindowState.loaded;
            }
        }
        catch (e) {
            this.error = e;
            this.title = "This page can\u2019t be displayed";
            this.state = CoreWindowState.errored;

            Events.getInstance()
                .dispatchEvent(new CoreWindowEvent("core-window-errored", this));

            console.error(e);
        }
    }

    setBounds({ x, y, width, height }: Position & Size) {
        this._position = { x: x, y: y };
        this._size = { width: width, height: height };

        this._view.style.setProperty("--width", `${width}px`);
        this._view.style.setProperty("--height", `${height}px`);
        this._view.style.setProperty("--left", `${x}px`);
        this._view.style.setProperty("--top", `${y}px`);

        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-bounds-changed", this));
    }

    focus() {
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-focus", this));
    }

    requestClose() {
        CoreWindowLayoutManager.getInstance().removeWindowFromLayout(this);
        this.visible = false;
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-close-requested", this));
    }

    close() {
        this.state = CoreWindowState.closed;
        this.view.remove();
        CoreWindowLayoutManager.getInstance().removeWindowFromLayout(this);
        CoreWindowManager.deleteWindowById(this.id);
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-closed", this));
    }

    private registerCallback(callback: (msg: Message) => any | Promise<any>, persist: boolean = false) {
        const id = --this._callbackId;
        const handler = (msg: Message) => {
            if (!persist)
                this._callbackMap.delete(id);
            return callback(msg);
        };

        this._callbackMap.set(id, handler);
        return id;
    }

    private sendMessage<S = any, R = any>(msg: Message<S>): Promise<Message<R>> {
        return new Promise((resolve, reject) => {
            if (!this._messageChannel) {
                console.warn(`channel is null, is the process terminated? dropping message %s:%d, %O`, msg.type, msg.channel, msg);
                return;
            }

            console.debug(`sending message %s:%d, %O`, msg.type, msg.channel, msg);
            const channel = this.registerCallback((msg: Message) => {
                if (msg.errored) {
                    reject(msg.data);
                }
                else {
                    resolve(msg);
                }
            });

            this._messageChannel.port2.postMessage({
                type: msg.type,
                channel: msg.channel ?? channel,
                replyChannel: channel,
                data: msg.data
            });
        });
    }

    private postMessage<S = any>(msg: Message<S>): void {
        console.debug(`sending message %s:%d, %O`, msg.type, msg.channel, msg);
        this._messageChannel.port2.postMessage({
            type: msg.type,
            channel: msg.channel,
            replyChannel: msg.replyChannel,
            data: msg.data
        });
    }

    private async handleMessage(event: MessageEvent) {
        console.log(event.data);

        const data = event.data as Message;
        const resp = await doMessageHandling();

        this.postMessage({
            type: data.type,
            channel: data.replyChannel,
            replyChannel: data.channel,
            data: resp
        });

        function doMessageHandling() {
            if (data.type == AppLifecycleV1) {
                if (!this._deferralId) {
                    this.state = CoreWindowState.loaded;
                    console.log(`Window ${this.id} completed activation with no deferral.`);
                }
                else {
                    console.log(`Window ${this.id} got lifecycle response but has captured ActivatedDeferral`);
                }
            }

            if (data.type == ActivatedDeferralV1) {
                if (data.data.type == 'captured') {
                    this._deferralId = data.data.deferralId;
                    console.log(`Window ${this.id} captured ActivatedDeferral ${data.data.deferralId}`);
                }
                if (data.data.type == 'completed' && data.data.deferralId == this._deferralId) {
                    this._deferralId = null;
                    console.log(`Window ${this.id} completed ActivatedDeferral ${data.data.deferralId}`);

                    this.state = CoreWindowState.loaded;
                }
            }
        }
    }

    private async onLoaded(ev: Event) {        
        if (!(ev.target as HTMLIFrameElement).contentWindow)
            return;
        console.log(ev);

        this._view.contentWindow.postMessage({ type: CoreApplicationV1, data: { type: "initialized" } }, "*", [this._messageChannel.port1]);
        this._view.removeEventListener("load", this.onLoaded);

        let activationDetails = {
            kind: ActivationKind.launch,
            args: "",
            files: [] as any[], // would be StorageFile[]
            splashRect: {
                x: 0,
                y: 0,
                width: 620,
                height: 300
            }
        }

        const reply = await this.sendMessage({
            type: AppLifecycleV1,
            data: { type: "activated", details: activationDetails }
        });

        console.log(reply);
    }
}