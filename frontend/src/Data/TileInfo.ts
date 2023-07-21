import { Package } from "shared/Package"
import { PackageApplication } from "shared/PackageApplication"
import { TileSize } from "shared/TileSize";
import TileVisual from "../Tiles/TileVisual";

export default interface TileInfo {
    pack: Package;
    app: PackageApplication;
    size: TileSize;
    visual: TileVisual;
}