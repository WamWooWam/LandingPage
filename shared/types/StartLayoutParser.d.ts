import { TileSize } from "./TileSize";
export interface StartTileGroup {
    title: string;
    tiles: Array<RawTileProps>;
}
export interface RawTileProps {
    packageName: string;
    appId: string;
    query?: string;
    size: TileSize;
    fence: boolean;
}
export declare const parseLayout: (text: string, parser?: typeof DOMParser) => any[];
