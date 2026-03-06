import { RawTileProps, TileProps, TileSize } from "@landing-page/shared";

import { FenceTileProps } from "./FenceTileRenderer";
import { useTileInfo } from "./TileRenderer";

export function useTileSize(): { width: number, height: number } {
    const data = useTileInfo();
    return getTileSize(data.size);
}

export function getTileSize(size: TileSize): { width: number, height: number } {
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

export type TilePropsWithType = (TileProps | FenceTileProps) & {
    size: TileSize, type: "fence" | "tile",
    key: any,
    animColumn: number
};

export function collapseTiles(tiles: RawTileProps[]): Array<TilePropsWithType> {
    let fullTiles: TilePropsWithType[] = [];
    let currentFence: Array<TileProps> = null;
    let resetFence = (val: [] = null) => {
        if (currentFence && currentFence.length) {
            fullTiles.push({
                size: TileSize.square150x150,
                apps: currentFence,
                type: "fence",
                key: `${currentFence[0].packageName}!${currentFence[0].appId}`,
                animColumn: 0
            });
        }

        currentFence = val;
    }

    for (const tile of tiles) {
        if (tile.fence && tile.size === TileSize.square70x70) {
            resetFence([]);
            currentFence.push(tile);
            continue;
        }

        if (currentFence) {
            if (tile.size !== TileSize.square70x70) {
                resetFence();
            }
            else {
                if (currentFence.length === 4) {
                    resetFence([]);
                }

                currentFence.push(tile);
                continue;
            }
        }

        fullTiles.push({ type: 'tile', key: `${tile.packageName}!${tile.appId}`, animColumn: 0, ...tile });
    }

    resetFence([]);

    // console.log("collaped tiles");

    return fullTiles;
}

export function tileSizeToColumns(size: TileSize): number {
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

export function tileSizeToRows(size: TileSize): number {
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

export function calculateLayout(tiles: RawTileProps[], availableHeight: number, isMobile: boolean): { tileColumns: TilePropsWithType[][] } {
    let collapsedTiles = collapseTiles(tiles);
    return isMobile ? layoutMobile(collapsedTiles, availableHeight) : layoutDesktop(collapsedTiles, availableHeight);
}

export function layoutMobile(collapseTiles: TilePropsWithType[], availableHeight: number): { tileColumns: TilePropsWithType[][] } {
    let tileColumn: TilePropsWithType[] = [];
    let width = 0;

    for (let i = 0; i < collapseTiles.length; i++) {
        let tile = collapseTiles[i];
        if (tile.size === TileSize.square310x310 || tile.size === TileSize.wide310x150) {
            if (i === 0)
                continue;

            let lastTile = collapseTiles[i - 1];
            if (lastTile.size !== TileSize.square310x310 && lastTile.size !== TileSize.wide310x150)
                continue;

            let swapIdx = -1;
            for (let j = i + 1; j < collapseTiles.length; j++) {
                if (collapseTiles[j].size !== TileSize.square310x310 && collapseTiles[j].size !== TileSize.wide310x150) {
                    swapIdx = j;
                    break;
                }
            }

            if (swapIdx !== -1) {
                let temp = collapseTiles[i];
                collapseTiles[i] = collapseTiles[swapIdx];
                collapseTiles[swapIdx] = temp;
            }

            i++;
        }
    }

    for (let i = 0; i < collapseTiles.length; i++) {
        let tile = { ...collapseTiles[i] };
        if (tile.size === TileSize.square310x310) {
            tile.size = TileSize.wide310x150;
        }

        tile.animColumn = width % 3;
        width += tileSizeToColumns(tile.size);

        tileColumn.push(tile);
    }

    console.log("mobile layout", tileColumn);

    return { tileColumns: [tileColumn] };
}

export function layoutDesktop(collapseTiles: TilePropsWithType[], availableHeight: number): { tileColumns: TilePropsWithType[][] } {
    let maxRows = Math.min(Math.max(1, Math.floor(availableHeight / 128)), 6);

    let row = 0;
    let column = 0;

    let lastHeight = 0;
    let lastWidth = 0;

    // a column is two tiles, or one wide tile wide (248px)
    let tileColumns: TilePropsWithType[][] = [];
    let currentColumn: TilePropsWithType[] = [];

    let newColumn = (width: number, height: number): [row: number, column: number] => {
        if (currentColumn.length)
            tileColumns.push(currentColumn);

        currentColumn = [];
        row = 0;
        column = 0;

        return [0, 0];
    }

    let getPosition = (width: number, height: number): [row: number, column: number] => {
        let tileColumn = column;

        column += width;
        if (column >= 2 || (width === 1 && lastWidth === 2)) {
            row += lastHeight;
            column = 0;
        }

        let tileRow = row;
        if (tileRow + height > maxRows) {
            [tileRow, tileColumn] = newColumn(width, height);
        } else {
            tileColumn = column;
        }

        lastHeight = height;
        lastWidth = width;

        return [tileRow, tileColumn];
    }

    for (const tile of collapseTiles) {
        if (maxRows <= 1 && tile.size === TileSize.square310x310) {
            tile.size = TileSize.wide310x150;
        }

        let tileWidth = tileSizeToColumns(tile.size);
        let tileHeight = tileSizeToRows(tile.size);

        let [tileRow, tileColumn] = getPosition(tileWidth, tileHeight);
        currentColumn.push({ ...tile, row: tileRow, column: tileColumn, animColumn: tileColumn });
    }

    tileColumns.push(currentColumn);

    return { tileColumns };
}