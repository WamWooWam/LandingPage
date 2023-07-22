import Events from "../Events";
import CoreWindowEvent from "../Events/CoreWindowEvent";
import AppInstance from "./AppInstance";
import CoreWindowManager from "./CoreWindowManager";
import CoreWindowState from "./CoreWindowState";
import { Position, Size, newGuid } from "../Util";
import { Package } from "shared/Package";
import { PackageApplication } from "shared/PackageApplication";
import CoreWindowLayoutManager from "./CoreWindowLayoutManager";

export default class CoreWindow {
    error: Error | null;

    private _id: string
    private _instance: AppInstance
    private _view: HTMLElement
    private _state: CoreWindowState;
    private _size: Size;
    private _position: Position;
    private _title: string;
    private _visible: boolean;

    constructor(instance: AppInstance) {
        this._id = `CoreWindow_${newGuid()}`
        this._instance = instance
        this._state = CoreWindowState.uninitialized;
        this._size = { width: 0, height: 0 };
        this._position = { x: 0, y: 0 };
        this._title = '';
        this._visible = false
        this._view = document.createElement("div");
        this._view.id = this._id;

        this._view.addEventListener("click", () => {
            this.focus();
        });

        this._view.addEventListener("contextmenu", (e) => {
            e.preventDefault();
        });
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

    get instance(): AppInstance {
        return this._instance;
    }

    get view(): HTMLElement {
        return this._view;
    }

    get title(): string {
        return this._title;
    }

    set title(newTitle: string) {
        this._title = newTitle.trim();

        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-title-changed", this));
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
        return this._visible;
    }

    set visible(newVisible: boolean) {
        this._visible = newVisible;
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

    async load(): Promise<void> {
        if (this.state != CoreWindowState.uninitialized) return;
        this.state = CoreWindowState.loading;
        await new Promise((resolve) => setTimeout(resolve, 750));

        try {
            let app = this.packageApplication;
            if (app.load) {
                let instance = await app.load();
                let ret = instance.default(this.instance, this);
                if (ret instanceof Promise) {
                    await ret;
                }

                this.state = CoreWindowState.loaded;

                Events.getInstance()
                    .dispatchEvent(new CoreWindowEvent("core-window-loaded", this));
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

        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-bounds-changed", this));
    }

    focus() {
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-focus", this));

        this.view.focus();
    }

    close() {
        // this.state = CoreWindowState.closed;
        // this.view.remove();
        // CoreWindowManager.deleteWindowById(this.id);

        CoreWindowLayoutManager.getInstance().removeWindow(this.id);
        this._visible = false;
        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-closed", this));
    }
}