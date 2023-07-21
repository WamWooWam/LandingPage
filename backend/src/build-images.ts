import { Thumbnail } from "./providers/thumbnail";
import { DOMParser } from "xmldom";

globalThis.DOMParser = DOMParser;

(async () => {
    await Thumbnail.generateThumbnailSvg("images/og-image.svg");
    await Thumbnail.generateThumbnailPng("images/og-image.png");
})();