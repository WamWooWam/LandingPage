import { Position, Size } from "../Util";

import AppInstance from "./AppInstance";
import CoreWindow from "./CoreWindow";
import TileInfo from "./TileInfo";

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
