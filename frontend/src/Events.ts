import { Package, PackageApplication, TileSize } from "landing-page-shared";
import { TileVisual } from "./Tiles/TileVisual";

// singleton class used to route events between components
export class Events {
    private static instance: Events;
    private eventTarget: EventTarget;

    private constructor() {
        this.eventTarget = document.createElement('div');
    }

    public static getInstance(): Events {
        if (!Events.instance) {
            Events.instance = new Events();
        }

        return Events.instance;
    }

    public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        this.eventTarget.addEventListener(type, listener, options);
    }

    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
        this.eventTarget.removeEventListener(type, listener, options);
    }

    public dispatchEvent(event: Event): boolean {
        return this.eventTarget.dispatchEvent(event);
    }
}

interface AppLaunchEventParams {
    tileX: number;
    tileY: number;
    tileWidth: number;
    tileHeight: number;
    tileVisual: TileVisual;
    tileSize: TileSize;
};

export class AppLaunchRequestedEvent extends Event {
    readonly package: Package;
    readonly packageApplication: PackageApplication;

    readonly params?: AppLaunchEventParams;

    constructor(pack: Package, app: PackageApplication, params?: AppLaunchEventParams) {
        super("app-launch-requested");
        this.package = pack;
        this.packageApplication = app;
        this.params = params;
    }
}