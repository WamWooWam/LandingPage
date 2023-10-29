// the layout has 2 possible states, one fullscreen window, or 2 windows side by side
// when in split mode, the windows can be resized by dragging the divider between them

import CoreWindow from "./CoreWindow";
import CoreWindowSnapState from "./CoreWindowSnapState";
import Events from "../Events";
import LayoutUpdatedEvent from "../Events/LayoutUpdatedEvent";
import ViewSizePreference from "./ViewSizePreference";

export enum CoreWindowLayoutKind {
    fullScreen,
    split
}

export default class CoreWindowLayoutManager {
    private static instance: CoreWindowLayoutManager;
    public static getInstance(): CoreWindowLayoutManager {
        if (!CoreWindowLayoutManager.instance) {
            CoreWindowLayoutManager.instance = new CoreWindowLayoutManager();
        }

        return CoreWindowLayoutManager.instance;
    }

    constructor() {
        // BUGBUG: should be using resizeobserver?
        if ('ResizeObserver' in globalThis) {
            new ResizeObserver(() => this.recalculateLayout()).observe(document.body);
        }
        else {
            window.addEventListener('resize', () => this.recalculateLayout());
        }
    }

    private state: CoreWindowLayoutKind = CoreWindowLayoutKind.fullScreen;
    private splitRatio: number = 0.5;

    private leftWindow: CoreWindow | null = null;
    private rightWindow: CoreWindow | null = null;

    public addWindowToLayout(window: CoreWindow, sizePreference: ViewSizePreference): boolean {
        if (this.leftWindow && this.rightWindow && sizePreference !== ViewSizePreference.default) {
            return false;
        }

        if (this.leftWindow === window || this.rightWindow === window) {
            return false;
        }

        // full screen
        if (sizePreference === ViewSizePreference.default) {
            this.leftWindow = window;
            this.rightWindow = null;
            this.state = CoreWindowLayoutKind.fullScreen;
        }
        else {
            if (this.leftWindow) {
                this.rightWindow = window;
                this.state = CoreWindowLayoutKind.split;
            }
            else if (this.rightWindow) {
                this.leftWindow = window;
                this.state = CoreWindowLayoutKind.split;
            }
            else {
                this.leftWindow = window;
                this.state = CoreWindowLayoutKind.fullScreen;
            }
        }

        this.recalculateLayout();
        return true;
    }

    public snapWindow(window: CoreWindow, snap: CoreWindowSnapState) {
        if (snap === CoreWindowSnapState.none || snap === CoreWindowSnapState.full) {
            this.leftWindow = window;
            this.rightWindow = null;
            this.state = CoreWindowLayoutKind.fullScreen;
        }
        else {
            if (snap === CoreWindowSnapState.left) {
                let temp = this.leftWindow;
                this.leftWindow = window;
                this.rightWindow = temp === window ? null : temp;
            }
            else {
                let temp = this.rightWindow;
                this.rightWindow = window;
                this.leftWindow = temp === window ? null : temp;
            }

            this.state = CoreWindowLayoutKind.split;
        }

        this.recalculateLayout();
    }

    public removeWindowFromLayout(window: CoreWindow, doUnsnap: boolean = true): boolean {
        if (this.leftWindow !== window && this.rightWindow !== window) {
            return false;
        }

        if (this.leftWindow === window) {
            this.leftWindow = null;
        }
        else {
            this.rightWindow = null;
        }

        if (doUnsnap || (this.leftWindow === null && this.rightWindow === null)) {
            this.state = CoreWindowLayoutKind.fullScreen;
        }

        this.recalculateLayout();
    }

    public getLayoutInfo(): { state: CoreWindowLayoutKind, windows: CoreWindow[] } {
        return { state: this.state, windows: (this.state === CoreWindowLayoutKind.fullScreen ? [this.leftWindow] : [this.leftWindow, this.rightWindow]) };
    }

    private recalculateLayout(): void {
        if (this.state === CoreWindowLayoutKind.fullScreen) {
            if (!this.leftWindow && this.rightWindow) {
                this.leftWindow = this.rightWindow;
                this.rightWindow = null;
            }

            this.leftWindow?.setBounds({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
        }
        else {
            let totalWidth = window.innerWidth - 22;
            let leftWidth = Math.floor(totalWidth * this.splitRatio);
            let rightWidth = totalWidth - leftWidth;

            this.leftWindow?.setBounds({ x: 0, y: 0, width: leftWidth, height: window.innerHeight });
            this.rightWindow?.setBounds({ x: leftWidth + 22, y: 0, width: rightWidth, height: window.innerHeight });
        }

        Events.getInstance().dispatchEvent(new LayoutUpdatedEvent());
    }
}