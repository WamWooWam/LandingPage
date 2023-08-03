import PackageRegistry from "../../PackageRegistry";

export namespace Standalone.Manifest {
    export function getManifest(req, res) {
        const packageId = req.params.package;
        const appId = req.params.app;

        if (!packageId || !appId) {
            res.status(404).send('Not found!');
            return;
        }

        let pack = PackageRegistry.getPackage(packageId);
        if (!pack) {
            res.status(404).send('Not found!');
            return;
        }
        // basic check for prototype pollution
        if (appId.startsWith('__proto__') || appId.startsWith('constructor')) {
            res.status(404).send('Not found!');
            return;
        }
        let app = pack.applications[appId];
        if (!app) {
            res.status(404).send('Not found!');
            return;
        }

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

    export function getApplicationConfig(req, res) {
        const packageId = req.params.package;
        const appId = req.params.app;

        if (!packageId || !appId) {
            res.status(404).send('Not found!');
            return;
        }

        let pack = PackageRegistry.getPackage(packageId);
        if (!pack) {
            res.status(404).send('Not found!');
            return;
        }
        // basic check for prototype pollution
        if (appId.startsWith('__proto__') || appId.startsWith('constructor')) {
            res.status(404).send('Not found!');
            return;
        }
        let app = pack.applications[appId];
        if (!app) {
            res.status(404).send('Not found!');
            return;
        }

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
}