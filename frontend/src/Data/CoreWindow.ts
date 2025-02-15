import { Position, Size, newGuid } from '../Util';

import AppInstance from './AppInstance';
import CoreWindowEvent from '../Events/CoreWindowEvent';
import CoreWindowLayoutManager from './CoreWindowLayoutManager';
import CoreWindowManager from './CoreWindowManager';
import CoreWindowState from './CoreWindowState';
import Events from '../Events';
import { Package } from 'shared/Package';
import { PackageApplication } from 'shared/PackageApplication';
import { Signal } from '@preact/signals';
import { ensureCapabilitiesAsync } from './PackageCapabilities';

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

    private _id: string;
    private _instance: AppInstance;
    private _view: HTMLElement;
    private _state: CoreWindowState;
    private _size: Size;
    private _position: Position;
    private _signals: CoreWindowSignals = new CoreWindowSignals();

    constructor(instance: AppInstance) {
        this._id = `CoreWindow_${newGuid()}`;
        this._instance = instance;
        this._state = CoreWindowState.uninitialized;
        this._size = { width: 0, height: 0 };
        this._position = { x: 0, y: 0 };
        this._view = document.createElement('div');
        this._view.id = this._id;

        this.signals.title.value = '';
        this.signals.isVisible.value = false;

        this._view.addEventListener('click', (e) => {
            e.stopPropagation();
            this.focus();
        });

        this._view.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
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

    get instance(): AppInstance {
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
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-bounds-changed', this),
        );
    }

    get position(): Position {
        return this._position;
    }

    set position(newPosition: Position) {
        this._position = newPosition;
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-bounds-changed', this),
        );
    }

    get visible(): boolean {
        return this.signals.isVisible.value;
    }

    set visible(newVisible: boolean) {
        this.signals.isVisible.value = newVisible;
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-visibility-changed', this),
        );
    }

    get state(): CoreWindowState {
        return this._state;
    }

    set state(newState: CoreWindowState) {
        if (this._state == newState) return;

        this._state = newState;
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-state-changed', this),
        );
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
        if (!CoreWindowManager.isStandalone()) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        await ensureCapabilitiesAsync(this.package);

        try {
            let app = this.packageApplication;
            if (app.load) {
                let instance = await app.load();
                let ret = instance.default(this.instance, this);
                if (ret instanceof Promise) {
                    await ret;
                }

                this.state = CoreWindowState.loaded;

                Events.getInstance().dispatchEvent(
                    new CoreWindowEvent('core-window-loaded', this),
                );
            }
        } catch (e) {
            this.error = e;
            this.title = 'This page can\u2019t be displayed';
            this.state = CoreWindowState.errored;

            Events.getInstance().dispatchEvent(
                new CoreWindowEvent('core-window-errored', this),
            );

            console.error(e);
        }
    }

    setBounds({ x, y, width, height }: Position & Size) {
        this._position = { x: x, y: y };
        this._size = { width: width, height: height };

        this._view.style.setProperty('--width', `${width}px`);
        this._view.style.setProperty('--height', `${height}px`);
        this._view.style.setProperty('--left', `${x}px`);
        this._view.style.setProperty('--top', `${y}px`);

        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-bounds-changed', this),
        );
    }

    focus() {
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-focus', this),
        );

        // this.view.focus();
    }

    requestClose() {
        // this.state = CoreWindowState.closed;
        // this.view.remove();
        // CoreWindowManager.deleteWindowById(this.id);

        CoreWindowLayoutManager.getInstance().removeWindowFromLayout(this);
        this.visible = false;
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-close-requested', this),
        );
    }

    close() {
        this.state = CoreWindowState.closed;
        this.view.remove();
        CoreWindowLayoutManager.getInstance().removeWindowFromLayout(this);
        CoreWindowManager.deleteWindowById(this.id);
        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-closed', this),
        );
    }
}
