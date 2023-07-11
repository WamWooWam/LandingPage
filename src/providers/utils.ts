import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";

export function createRoot(): Document {
    return new DOMParser().parseFromString("<tile></tile>", "application/xml");
}

export function createVisual(document: Document): Element {
    let visual = document.createElement("visual");
    visual.setAttribute("version", "4");
    document.documentElement.appendChild(visual);
    return visual;
}

export function createBindingFromTemplate(document: Document, visual: Element, template: TileTemplateType): Element {
    let content = TileUpdateManager.getTemplateContent(template);
    let element = content.getElementsByTagName("visual")[0].firstChild as Element;

    let newElement = document.importNode(element, true) as Element;
    visual.appendChild(newElement);

    return newElement;
}