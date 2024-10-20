import { Position, Size } from "../Util";

import CoreApplication from "./CoreApplication";
import CoreWindow from "./CoreWindow";
import TileInfo from "./TileInfo";

interface CoreWindowLaunchTileParams {
    tile: TileInfo;
    position: Position;
    size: Size;
}

export default interface CoreWindowLaunchParams {
    instance: CoreApplication;
    window: CoreWindow;
    origin: CoreWindowLaunchTileParams;

    targetPosition: Position;
    targetSize: Size;
}
