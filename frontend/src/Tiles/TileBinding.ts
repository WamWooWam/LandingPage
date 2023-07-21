import { TileSize } from "shared/TileSize";
import TileElement from "./TileElement";

export default interface TileBinding {
    id: number;
    size: TileSize;
    template: string;
    fallback: string;
    elements: TileElement[];
}
