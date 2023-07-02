import { TileSize } from "./TileSize";
import { RawTileProps } from "./StartLayoutParser"

export interface TileProps {
    packageName: string;
    appId: string;
    size: TileSize;
    row?: number;
    column?: number;
    width?: number;
    height?: number;
}

export interface FenceTileProps {
    apps: TileProps[]
    row?: number;
    column?: number;
    width?: number;
    height?: number;
}

export type TilePropsWithType = (TileProps | FenceTileProps) & { type: "tile" | "fence" };

export function tileSizeToWidth(size: TileSize): number {
    switch (size) {
        case TileSize.square150x150:
            return 1;
        case TileSize.wide310x150:
        case TileSize.square310x310:
            return 2;
        case TileSize.square70x70: // handled separately
        default:
            throw new Error("Invalid tile size!")
    }
}

export function tileSizeToHeight(size: TileSize): number {
    switch (size) {
        case TileSize.square150x150:
        case TileSize.wide310x150:
            return 1;
        case TileSize.square310x310:
            return 2;
        case TileSize.square70x70: // handled separately
        default:
            throw new Error("Invalid tile size!")
    }
}

export function collapseTiles(tiles: RawTileProps[]): Array<TilePropsWithType> {
    let fullTiles: TilePropsWithType[] = [];
    let currentFence: Array<RawTileProps> | null = null;

    let resetFence = (val: [] | null = null) => {
        if (currentFence && currentFence.length) {
            fullTiles.push({
                size: TileSize.square150x150,
                apps: currentFence,
                type: "fence",
            });
        }

        return val;
    }

    for (const tile of tiles) {
        if (tile.fence && tile.size === TileSize.square70x70) {
            currentFence = resetFence([]);
            currentFence!.push(tile);
            continue;
        }

        if (currentFence !== null) {
            if (tile.size !== TileSize.square70x70) {
                currentFence = resetFence();
            }
            else if (currentFence !== null) {
                if (currentFence!.length === 4) {
                    currentFence = resetFence([]);
                }

                currentFence!.push(tile);
                continue;
            }

        }

        fullTiles.push({ type: 'tile', ...tile });
    }

    currentFence = resetFence([]);

    console.log("collaped tiles");

    return fullTiles;
}

export function layoutDesktop(collapsedTiles: any[], availableHeight: number): Array<TilePropsWithType> {
    let maxRows = Number.isFinite(availableHeight) ? Math.floor(availableHeight / 128) : availableHeight; 
    let row = 0;
    let column = 0;
    let baseColumn = 0;

    let lastWidth = 0;
    let lastHeight = 0;
    let tiles: TilePropsWithType[] = [];

    for (const tile of collapsedTiles) {
        let tileWidth = tileSizeToWidth(tile.size);
        let tileHeight = tileSizeToHeight(tile.size);

        if ((column - baseColumn) >= 2) {
            if ((row + Math.max(lastHeight, tileHeight)) >= maxRows) {
                row = 0;
                baseColumn += 2;
            }
            else {
                row += lastHeight;
            }

            column = baseColumn;
        }


        if (tile.type === 'fence') {
            tiles.push({ row, column, width: 1, height: 1, ...tile });
        }
        else {
            tiles.push({ row, column, width: tileWidth, height: tileHeight, ...tile });
        }

        column += tileWidth;
        lastWidth = tileWidth;
        lastHeight = tileHeight;
    }

    return tiles;
}