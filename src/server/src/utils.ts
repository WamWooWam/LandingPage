import { Package, PackageApplication } from "@landing-page/shared";

import PackageRegistry from "./PackageRegistry";
import { TileTemplateType } from "./TileTemplateType";
import { TileUpdateManager } from "./TileUpdateManager";

import xmldom = require("xmldom");

export const EXT_XMLNS = "https://wamwoowam.co.uk/tiles/2022";

export function createRoot(): Document {
    return new xmldom.DOMParser().parseFromString("<tile xmlns=\"\" xmlns:ext=\"https://wamwoowam.co.uk/tiles/2022\"></tile>", "application/xml");
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

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export function getAppAndPackage(appId: string, packageId: string): { app: PackageApplication; pack: Package; appId: string; packageId: string; } {
    if (!packageId ||
        !appId ||
        typeof packageId !== 'string' ||
        typeof appId !== 'string') {
        throw new HttpError(400, 'Bad Request');
    }

    // basic check for prototype pollution
    if (appId.startsWith('__proto__') || appId.startsWith('constructor')) {
        throw new HttpError(404, 'Not found!');
    }

    let pack = PackageRegistry.getPackage(packageId);
    if (!pack) { 
        throw new HttpError(404, 'Not found!');
    }

    let app = pack.applications[appId];
    if (!app) {
        throw new HttpError(404, 'Not found!');
    }

    return { app, pack, appId: app.id, packageId: pack.identity.packageFamilyName };
}