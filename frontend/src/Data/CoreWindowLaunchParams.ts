import { Position, Size } from "../Util";
import TileInfo from "./TileInfo";
import AppInstance from "./AppInstance";
import CoreWindow from "./CoreWindow";

interface CoreWindowLaunchTileParams {
    tile: TileInfo;
    position: Position;
    size: Size;
}

export default interface CoreWindowLaunchParams {
    instance: AppInstance;
    window: CoreWindow;
    origin: CoreWindowLaunchTileParams;

    targetPosition: Position;
    targetSize: Size;
}
