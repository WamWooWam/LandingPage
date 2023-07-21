import TileVisual from "../Tiles/TileVisual";
import { Package } from "shared/Package"
import { PackageApplication } from "shared/PackageApplication"
import { TileSize } from "shared/TileSize";

interface AppLaunchEventParams {
    tileX: number;
    tileY: number;
    tileWidth: number;
    tileHeight: number;
    tileVisual: TileVisual;
    tileSize: TileSize;
};

export default class AppLaunchRequestedEvent extends Event {
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
