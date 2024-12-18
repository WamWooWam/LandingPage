import { FenceTileProps } from './FenceTileRenderer';
import { RawTileProps } from 'shared/StartLayoutParser';
import { TileProps } from './TileRenderer';
import { TileSize } from 'shared/TileSize';

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

export type TilePropsWithType = (TileProps | FenceTileProps) & {
    size: TileSize;
    type: 'fence' | 'tile';
    key: any;
    animColumn: number;
};

export function collapseTiles(tiles: RawTileProps[]): Array<TilePropsWithType> {
    let fullTiles: TilePropsWithType[] = [];
    let currentFence: Array<TileProps> = null;
    let resetFence = (val: [] = null) => {
        if (currentFence && currentFence.length) {
            fullTiles.push({
                size: TileSize.square150x150,
                apps: currentFence,
                type: 'fence',
                key: `${currentFence[0].packageName}!${currentFence[0].appId}`,
                animColumn: 0,
            });
        }

        currentFence = val;
    };

    for (const tile of tiles) {
        if (tile.fence && tile.size === TileSize.square70x70) {
            resetFence([]);
            currentFence.push(tile);
            continue;
        }

        if (currentFence) {
            if (tile.size !== TileSize.square70x70) {
                resetFence();
            } else {
                if (currentFence.length === 4) {
                    resetFence([]);
                }

                currentFence.push(tile);
                continue;
            }
        }

        fullTiles.push({
            type: 'tile',
            key: `${tile.packageName}!${tile.appId}`,
            animColumn: 0,
            ...tile,
        });
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
            throw new Error('Invalid tile size!');
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
            throw new Error('Invalid tile size!');
    }
}

export function calculateLayout(
    tiles: RawTileProps[],
    availableHeight: number,
    isMobile: boolean,
): { tileColumns: TilePropsWithType[][] } {
    let collapsedTiles = collapseTiles(tiles);
    return layoutDesktopNew(collapsedTiles, availableHeight);
}

export function layoutDesktopNew(
    collapseTiles: TilePropsWithType[],
    availableHeight: number,
): { tileColumns: TilePropsWithType[][] } {
    let maxRows = Math.max(1, Math.floor(availableHeight / 128));
    let row = 0;
    let column = 0;

    let lastWidth = 0;
    let lastHeight = 0;

    // a column is two tiles, or one wide tile wide (248px)
    let tileColumns: TilePropsWithType[][] = [];
    let currentColumn: TilePropsWithType[] = [];

    for (const tile of collapseTiles) {
        if (maxRows <= 1 && tile.size === TileSize.square310x310) {
            tile.size = TileSize.wide310x150;
        }

        let tileWidth = tileSizeToColumns(tile.size);
        let tileHeight = tileSizeToRows(tile.size);

        if (column + tileWidth > 2) {
            if (row + Math.max(lastHeight, tileHeight) >= maxRows) {
                tileColumns.push(currentColumn);
                currentColumn = [];
                row = 0;
            } else {
                row += lastHeight;
            }

            column = 0;
        }

        currentColumn.push({ row, column, ...tile, animColumn: 0 });

        column += tileWidth;
        lastWidth = tileWidth;
        lastHeight = tileHeight;
    }

    tileColumns.push(currentColumn);

    console.log(tileColumns);

    return { tileColumns };
}

// TODO: use this to generate CSS directly
export function layoutDesktop(
    collapsedTiles: TilePropsWithType[],
    baseCol: number,
    availableHeight: number,
): { tiles: Array<TilePropsWithType>; columns: number } {
    let maxRows = Math.floor(availableHeight / 128);
    // console.log(`available height: ${availableHeight}, maxRows: ${maxRows}`);
    let row = 0;
    let column = 0;
    let baseColumn = 0;

    let lastWidth = 0;
    let lastHeight = 0;
    let tiles: TilePropsWithType[] = [];

    for (const tile of collapsedTiles) {
        let tileWidth = tileSizeToColumns(tile.size);
        let tileHeight = tileSizeToRows(tile.size);

        if (column - baseColumn >= 2) {
            if (row + Math.max(lastHeight, tileHeight) >= maxRows) {
                row = 0;
                baseColumn += 2;
            } else {
                row += lastHeight;
            }

            column = baseColumn;
        }

        tiles.push({ row, column, ...tile, animColumn: baseCol + baseColumn });

        column += tileWidth;
        lastWidth = tileWidth;
        lastHeight = tileHeight;
    }

    // BUGBUG: fix for a webkit bug where the container size is not calculated correctly
    let totalColumns = tiles.reduce(
        (prev, cur) => Math.max(prev, cur.column + tileSizeToColumns(cur.size)),
        0,
    );

    console.log(tiles, totalColumns);

    return { tiles, columns: totalColumns };
}
