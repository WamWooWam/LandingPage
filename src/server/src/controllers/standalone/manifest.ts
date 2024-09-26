import { Request, Response, Router } from "express";

import PackageRegistry from "../../PackageRegistry";
import { getAppAndPackage } from "../../utils";

function getManifest(req: Request, res: Response) {
    const { app, pack } = getAppAndPackage(req.params.app, req.params.package);
    const packageId = pack.identity.packageFamilyName;
    const appId = app.id;

    const manifest = {
        "name": app.visualElements.displayName,
        "short_name": app.visualElements.defaultTile.shortName ?? app.visualElements.displayName,
        "description": app.visualElements.description,
        "icons": [
            {
                "src": `/api/media/plated/${packageId}/${appId}/square30x30logo`,
                "sizes": "30x30",
                "type": "image/png"
            },
            {
                "src": `/api/media/plated/${packageId}/${appId}/square70x70logo`,
                "sizes": "70x70",
                "type": "image/png"
            },
            {
                "src": `/api/media/plated/${packageId}/${appId}/square150x150logo`,
                "sizes": "150x150",
                "type": "image/png"
            },
            {
                "src": `/api/media/plated/${packageId}/${appId}/wide310x150logo`,
                "sizes": "310x150",
                "type": "image/png"
            },
            {
                "src": `/api/media/plated/${packageId}/${appId}/square310x310logo`,
                "sizes": "310x310",
                "type": "image/png"
            },
            {
                "src": `/api/media/plated/${packageId}/${appId}/apple-touch-icon`,
                "sizes": "120x120",
                "type": "image/png"
            }
        ],
        "start_url": `/app/${packageId}/${appId}?source=pwa`,
        "display": "standalone",
        "background_color": app.visualElements.backgroundColor,
        "theme_color": app.visualElements.backgroundColor
    };

    res.json(manifest);
}

function getApplicationConfig(req: Request, res: Response) {
    const { app, pack } = getAppAndPackage(req.params.app, req.params.package);

    const packId = pack.identity.packageFamilyName;
    const id = app.id;
    const config = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
   <msapplication>
     <tile>
        <square70x70logo src="/api/media/normal/${packId}/${id}/square70x70Logo"/>
        <square150x150logo src="/api/media/normal/${packId}/${id}/square150x150logo"/>
        <wide310x150logo src="/api/media/normal/${packId}/${id}/wide310x150logo"/>
        <square310x310logo src="/api/media/normal/${packId}/${id}/square310x310logo"/>
        <TileColor>${app.visualElements.backgroundColor}</TileColor>
        <TileImage src="/api/media/normal/${packId}/${id}/square150x150logo"/>
     </tile>
   </msapplication>
</browserconfig>`;

    res.set('Content-Type', 'application/xml')
    res.send(config);
}

export default function registerRoutes(router: Router) {
    router.get('/manifest/:package/:app', getManifest);
    router.get('/msapplication-config/:package/:app', getApplicationConfig);
}