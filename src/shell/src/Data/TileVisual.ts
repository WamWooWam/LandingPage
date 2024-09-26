import TileBinding from "./TileBinding";

export default interface TileVisual {
    branding: "none" | "name" | "logo";
    bindings: TileBinding[];
}
