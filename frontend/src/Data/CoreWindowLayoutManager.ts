import Events from "../Events";
import CoreWindow from "./CoreWindow";
import CoreWindowLaunchParams from "./CoreWindowLaunchParams";
import CoreWindowLayoutParams from "./CoreWindowLayoutParams";
import CoreWindowManager from "./CoreWindowManager";
import LayoutUpdatedEvent from "../Events/LayoutUpdatedEvent";
import ViewSizePreference from "./ViewSizePreference";

// windows are stored in an array with a maximum of 4 windows depending on the screen size. 
// width is the width of the window as a percentage of the screen width
// if windowId is null, then this is empty space
interface CoreWindowLayout {
    windowId: string;
    width: number;
}

export default class CoreWindowLayoutManager {
    private static instance: CoreWindowLayoutManager;
    public static getInstance(): CoreWindowLayoutManager {
        if (!CoreWindowLayoutManager.instance) {
            CoreWindowLayoutManager.instance = new CoreWindowLayoutManager();
        }

        return CoreWindowLayoutManager.instance;
    }

    private layout: CoreWindowLayout[] = [];
    private maxWindows = 2;

    private constructor() {
        Events.getInstance().addEventListener("layout-updated", (e: LayoutUpdatedEvent) => {
            if (!e.detail.appendToHistory) return;
            let snapshot = this.getLayoutSnapshot();

            console.log("layout updated: %O", snapshot);
            window.history.pushState(snapshot, null, null);
        });

        window.addEventListener("popstate", (e) => {
            if (e.state && e.state.v === 1) {
                this.setLayoutSnapshot(e.state);
            }
        });

        window.addEventListener("resize", () => {
            this.recalculateLayout();
        });
    }

    public getVisibleWindows(): CoreWindow[] {
        return this.layout.filter(l => l.windowId !== null).map(l => CoreWindowManager.getWindowById(l.windowId));
    }

    // gets the target launch params for a window
    public addWindowToLayout(window: CoreWindow, sizePreference: ViewSizePreference): void {
        let layout = this.layout.find(l => l.windowId === window.id);
        if (layout) {
            return;
        }

        switch (sizePreference) {
            case ViewSizePreference.default:
                this.addWindowDefault(window, layout);
                break;
            case ViewSizePreference.useMore:
            case ViewSizePreference.useLess:
            case ViewSizePreference.useHalf:
            case ViewSizePreference.useMinimum:
                this.addWindowSplitScreen(window, layout, sizePreference);
                break;
        }

        this.recalculateLayout();
    }

    private addWindowDefault(window: CoreWindow, layout: CoreWindowLayout) {
        // if there is an empty space, use that
        let index = this.layout.findIndex(l => l.windowId === null);
        if (index >= 0) {
            this.layout[index].windowId = window.id;
        }
        else {
            // replace all windows with the new window
            this.layout = [{ windowId: window.id, width: 1 }];
        }
    }

    private addWindowSplitScreen(window: CoreWindow, layout: CoreWindowLayout, sizePreference: ViewSizePreference) {
        if (this.layout.length >= this.maxWindows) {
            // remove leftmost window
            let window = CoreWindowManager.getWindowById(this.layout[0].windowId);
            if (window) {
                window.close();
            }
            this.layout.shift();
        }

        let index = this.layout.findIndex(l => l.windowId === null);
        if (index >= 0) {
            // there is an empty space, use that
            this.layout[index].windowId = window.id;
        }
        else {
            index = this.layout.length;
            // resize all other windows to fit
            let totalWidth = 1
            let newWidth = 1 / (this.layout.length + 1);
            for (let i = 0; i < this.layout.length; i++) {
                this.layout[i].width = this.layout[i].width / totalWidth * (1 - newWidth);
            }

            this.layout.push({ windowId: window.id, width: newWidth });
        }
    }

    public removeWindow(windowId: string): void {
        let index = this.layout.findIndex(l => l.windowId === windowId);
        if (index >= 0) {
            this.layout[index].windowId = null;
            this.recalculateLayout();
        }
    }
    
    // return an object that can be used to restore the layout
    private getLayoutSnapshot(): any {
        let snapshot = [];
        for (const layoutWindow of this.layout) {
            let window = CoreWindowManager.getWindowById(layoutWindow.windowId);
            if (window) {
                snapshot.push({
                    window: {
                        packageId: window.package.identity.packageFamilyName,
                        appId: window.packageApplication.id,
                        instanceId: window.instance.id,
                        id: window.id,
                        visible: window.visible
                    },
                    width: layoutWindow.width
                });
            }
            else {
                snapshot.push({ width: layoutWindow.width });
            }
        }

        return { v: 1, layout: snapshot };
    }

    // restore the layout from a snapshot
    private setLayoutSnapshot(snapshot: any): void {
        const layout = snapshot.layout;
        this.layout = [];
        for (const layoutWindow of layout) {
            // TODO: we may need to recreate the window here
            let window = CoreWindowManager.getWindowById(layoutWindow.window.id);
            if (window) {
                this.layout.push({
                    windowId: window.id,
                    width: layoutWindow.width
                });
            }
            else {
                this.layout.push({ width: layoutWindow.width, windowId: null });
            }
        }

        this.recalculateLayout();
    }

    private recalculateLayout(): void {
        let totalWidth = globalThis.innerWidth - (22 * (this.layout.length - 1));
        let totalHeight = globalThis.innerHeight;

        let leftWidth = 0;
        for (let i = 0; i < this.layout.length; i++) {
            let window = CoreWindowManager.getWindowById(this.layout[i].windowId);
            if (window) {
                window.setBounds({ x: totalWidth * leftWidth + (22 * (i)), y: 0, width: totalWidth * this.layout[i].width, height: totalHeight });
            }

            leftWidth += this.layout[i].width
        }

        Events.getInstance().dispatchEvent(new LayoutUpdatedEvent());
    }
}