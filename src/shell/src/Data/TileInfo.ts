import { Package, PackageApplication, TileSize } from "@landing-page/shared";

import TileVisual from "~/Data/TileVisual";

export default interface TileInfo {
    pack: Package;
    app: PackageApplication;
    size: TileSize;
    visual: TileVisual;
}