import TileElement from "~/Data/TileElement";
import TileVisual from "~/Data/TileVisual";
import { TileSize } from "shared/TileSize";
import { EXT_XMLNS } from "~/Util";

export function getTileSizeForTemplate(template: string): TileSize {
    // Windows 8.1 types
    if (template.startsWith("TileWide310x150"))
        return TileSize.wide310x150;
    else if (template.startsWith("TileSquare150x150"))
        return TileSize.square150x150;
    else if (template.startsWith("TileSquare310x310"))
        return TileSize.square310x310;
    else if (template.startsWith("TileSquare150x150"))
        return TileSize.square150x150;

    // Windows 8.0 types
    if (template.startsWith("TileWide"))
        return TileSize.wide310x150;
    else if (template.startsWith("TileSquare"))
        return TileSize.square150x150;

    throw new Error("Unknown tile size");
}


export function getVisuals(doc: Document, size: TileSize): TileVisual[] {
    let visuals = [];
    let visualElements = doc.getElementsByTagName("visual");
    for (const visualElement of visualElements) {
        let bindingElements = visualElement.querySelectorAll("binding");

        for (let i = 0; i < bindingElements.length; i++) {
            let element = bindingElements[i];
            let template = element.getAttribute("template");
            let fallback = element.getAttribute("fallback");

            if (getTileSizeForTemplate(template) !== size || (fallback && getTileSizeForTemplate(fallback) !== size))
                continue;

            let visual: TileVisual = { bindings: [] };
            visual.bindings.push({
                id: i + 1,
                size: size,
                template: template,
                fallback: fallback,
                elements: [...element.children].map(e => getElements(e))
            })


            visuals.push(visual);
        }
    }


    return visuals;
}

function getElements(node: Element): TileElement {
    return {
        id: parseInt(node.getAttribute("id")),
        type: <"image" | "text">node.tagName.toLowerCase(),
        content: node.tagName.toLowerCase() === "image" ? node.getAttribute("src") : node.textContent,
        alt: node.getAttributeNS(EXT_XMLNS, "alt")
    }
}