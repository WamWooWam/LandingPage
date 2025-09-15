import { Package, PackageApplication, TileSize } from "@landing-page/shared";

import TileVisual from "~/Data/TileVisual";

interface AppLaunchEventParams {
    tileX: number;
    tileY: number;
    tileWidth: number;
    tileHeight: number;
    tileVisual: TileVisual;
    tileSize: TileSize;
    noAnimation: boolean;
};

export default class AppLaunchRequestedEvent extends CustomEvent<Partial<AppLaunchEventParams>> {
    readonly package: Package;
    readonly packageApplication: PackageApplication;

    readonly params?: Partial<AppLaunchEventParams>;

    constructor(pack: Package, app: PackageApplication, params?: Partial<AppLaunchEventParams>) {
        super("app-launch-requested", { bubbles: true, cancelable: true });
        this.package = pack;
        this.packageApplication = app;
        this.params = params;
    }
}
