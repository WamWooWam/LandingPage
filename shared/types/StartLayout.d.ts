import { TileSize } from "./TileSize";
import { RawTileProps } from "./StartLayoutParser";
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
    apps: TileProps[];
    row?: number;
    column?: number;
    width?: number;
    height?: number;
}
export type TilePropsWithType = (TileProps | FenceTileProps) & {
    type: "tile" | "fence";
};
export declare function tileSizeToWidth(size: TileSize): number;
export declare function tileSizeToHeight(size: TileSize): number;
export declare function collapseTiles(tiles: RawTileProps[]): Array<TilePropsWithType>;
export declare function layoutDesktop(collapsedTiles: any[], availableHeight: number): Array<TilePropsWithType>;
