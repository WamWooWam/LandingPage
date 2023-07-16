import { TileElement } from "./TileElement";
import { TileSize } from "landing-page-shared";
import { TileVisual } from "./TileVisual";
import { EXT_XMLNS } from "../Util";

const TileTemplateComponentMap: Map<string, string[]> = new Map([
    ["TileSquare310x310ImageAndTextOverlay02", ["TileSquare310x310ImageAndTextOverlay02"]],
    ["TileWide310x150SmallImageAndText03", ["TileWide310x150SmallImageAndText"]],
    ["TileWide310x150PeekImage05", ["TileWide310x150PeekImage", "TileWide310x150SmallImageAndText"]],
    ["TileWide310x150Text09", ["TileWide310x150HeaderAndText"]],
    ["TileSquare150x150PeekImageAndText04", ["TileSquare150x150PeekImage", "TileSquare150x150Text"]],
    ["TileSquare150x150Text02", ["TileSquare150x150HeaderAndText"]],
    ["TileSquare150x150Text04", ["TileSquare150x150Text"]],
])

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

            var components = TileTemplateComponentMap.get(template);
            if (!components) {
                components = fallback && TileTemplateComponentMap.get(fallback);
                if (!components) {
                    console.warn(`unknown template ${template} (${fallback}). out of date client?`);
                    continue;
                }
            }

            for (let i = 0; i < components.length; i++) {
                let visual: TileVisual = { bindings: [] };
                visual.bindings.push({
                    id: i + 1,
                    size: size,
                    template: components[i],
                    fallback: element.getAttribute("fallback"),
                    elements: [...element.children].map(e => getElements(e))
                })


                visuals.push(visual);
            }
        }
    }

    console.log(`got ${visuals.length} visuals for size ${TileSize[size]}`)

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