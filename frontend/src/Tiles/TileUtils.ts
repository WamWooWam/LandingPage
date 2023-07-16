import { TileSize } from "landing-page-shared";

export function getTileSize(size: TileSize) {
    switch (size) {
        case TileSize.square70x70:
            return { width: 56, height: 56 };
        case TileSize.square150x150:
            return { width: 120, height: 120 };
        case TileSize.wide310x150:
            return { width: 248, height: 120 };
        case TileSize.square310x310:
            return { width: 248, height: 248 };
    }
}