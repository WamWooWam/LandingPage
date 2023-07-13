import { TileSize } from "landing-page-shared";
import { TileElement } from "./TileElement";

export interface TileBinding {
    id: number;
    size: TileSize;
    template: string;
    fallback: string;
    elements: TileElement[];
}
