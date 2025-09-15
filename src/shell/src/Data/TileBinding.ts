import TileElement from "./TileElement";
import { TileSize } from "@landing-page/shared";

export default interface TileBinding {
    id: number;
    size: TileSize;
    template: string;
    fallback: string;
    elements: TileElement[];
}
