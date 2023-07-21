import TileVisual from "./TileVisual";
import { getVisuals } from "./TileToast";
import { Package } from "shared/Package"
import { PackageApplication } from "shared/PackageApplication"
import { TileSize } from "shared/TileSize";

export type TileUpdateCallback = (visuals: Map<TileSize, TileVisual[]>) => void;

export default class TileUpdateManager {
    private static instance: TileUpdateManager = new TileUpdateManager();
    public static getInstance(): TileUpdateManager {
        return TileUpdateManager.instance;
    }

    private _tileUpdateMap: Map<PackageApplication, TileUpdateCallback[]> = new Map();
    private _visualsCache = new Map<PackageApplication, Map<TileSize, TileVisual[]>>();

    private _fetchQueue: PackageApplication[] = [];
    private _fetching: boolean = false;

    private _updateTimeout: number = 0;
    private _initialUpdate: number = 0;

    private constructor() {
        this._updateTimeout = window.setInterval(() => this.updateAllTiles(), 10 * 60 * 1000); // 10 minutes
        this._initialUpdate = window.setTimeout(() => this.updateAllTiles(), 2000); // kinda hacky? but it works
    }

    public registerVisualUpdateCallback(packageApplication: PackageApplication, callback: TileUpdateCallback): void {
        if (!this._tileUpdateMap.has(packageApplication)) {
            this._tileUpdateMap.set(packageApplication, []);
        }
        this._tileUpdateMap.get(packageApplication).push(callback);

        if (this._visualsCache.has(packageApplication)) {
            callback(this._visualsCache.get(packageApplication));
        }
        else {
            this._fetchQueue.push(packageApplication);
            if (!this._fetching && this._initialUpdate === 0) {
                this.processFetchQueue();
            }
        }
    }

    public unregisterVisualUpdateCallback(packageApplication: PackageApplication, callback: TileUpdateCallback): void {
        if (!this._tileUpdateMap.has(packageApplication)) {
            return;
        }
        let callbacks: TileUpdateCallback[] = this._tileUpdateMap.get(packageApplication);
        let index: number = callbacks.indexOf(callback);
        if (index >= 0) {
            callbacks.splice(index, 1);
        }
    }

    private async processFetchQueue(): Promise<void> {
        this._fetching = true;

        this._fetchQueue.reverse();
        while (this._fetchQueue.length > 0) {
            let packageApplication = this._fetchQueue.pop();
            if (await this.fetchVisuals(packageApplication) && this._fetchQueue.length > 0)
                await new Promise(resolve => setTimeout(resolve, 1000 / 3));
        }

        this._fetching = false;
    }

    private async fetchVisuals(packageApplication: PackageApplication): Promise<boolean> {
        if (!packageApplication?.visualElements.defaultTile.tileUpdateUrl)
            return false;

        console.log(`fetching visuals from ${packageApplication.visualElements.defaultTile.tileUpdateUrl} for ${packageApplication.id}`);

        let response = await fetch(packageApplication.visualElements.defaultTile.tileUpdateUrl);
        if (!response.ok) {
            console.warn(`failed to fetch visuals from ${packageApplication.visualElements.defaultTile.tileUpdateUrl} for ${packageApplication.id}`);
            return false;
        }

        let text = await response.text();
        let document = new DOMParser().parseFromString(text, "application/xml");

        let map = new Map<TileSize, TileVisual[]>();
        for (let size of [TileSize.wide310x150, TileSize.square150x150, TileSize.square310x310, TileSize.square70x70]) {
            map.set(size, getVisuals(document, size));
        }

        this._visualsCache.set(packageApplication, map);
        this.notifyVisualUpdate(packageApplication, map);
        return true;
    }

    private notifyVisualUpdate(packageApplication: PackageApplication, visuals: Map<TileSize, TileVisual[]>): void {
        if (!this._tileUpdateMap.has(packageApplication)) {
            return;
        }
        let callbacks: TileUpdateCallback[] = this._tileUpdateMap.get(packageApplication);
        for (let callback of callbacks) {
            callback(visuals);
        }
    }

    private async updateAllTiles(): Promise<void> {
        console.log("updating all tiles");
        for (let packageApplication of this._visualsCache.keys()) {
            this._fetchQueue.push(packageApplication);
        }

        if (!this._fetching) {
            this.processFetchQueue();
        }
    }
}