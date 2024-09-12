import { Request, Response, Router } from "express";
import { createBindingFromTemplate, createRoot, createVisual, getAppAndPackage } from "../../utils";

import { TileTemplateType } from "../../TileTemplateType";
import { XMLSerializer } from "xmldom";

function getEmmaTile(req: Request, res: Response) {
    const root = createRoot();
    const visual1 = createVisual(root);
    visual1.setAttribute("branding", "name");
    const content1 = createBindingFromTemplate(root, visual1, TileTemplateType.tileSquare150x150Image);

    let imageElement = content1.getElementsByTagName("image")[0];
    imageElement.setAttribute("src", "/api/media/normal/Friends_zfgz6xjnaz0ym/emma2/square150x150logo");

    const visual2 = createVisual(root);
    visual2.setAttribute("branding", "name");

    const content2 = createBindingFromTemplate(root, visual2, TileTemplateType.tileSquare150x150Image);

    imageElement = content2.getElementsByTagName("image")[0];
    imageElement.setAttribute("src", "/api/media/normal/Friends_zfgz6xjnaz0ym/emma/square150x150logo");

    res.contentType('application/xml')
        .send(new XMLSerializer().serializeToString(root));
}

export default function registerPeopleTiles(router: Router) {
    router.get('/people/emma.xml', getEmmaTile);
}