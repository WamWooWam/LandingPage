import { Package, PackageApplication, TileSize } from "landing-page-shared";
import { TileVisual } from "../Tiles/TileVisual";

export interface TileInfo {
    pack: Package;
    app: PackageApplication;
    size: TileSize;
    visual: TileVisual;
}