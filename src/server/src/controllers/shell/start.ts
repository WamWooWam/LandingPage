import { Request, Response, Router } from 'express';

import { Package } from '@landing-page/shared';
import PackageRegistry from 'src/PackageRegistry';
import path from 'path';

async function getStartScreen(req: Request, res: Response) {
    res.contentType("application/xml")
        .sendFile(path.resolve(__dirname, "../../../config/StartScreen.xml"));
}


function fixupUrl(pack: Package, relativeUrl: string | null | undefined): string | null {
    relativeUrl = relativeUrl?.replace(/\\/g, "/");

    if (relativeUrl)
        return `/packages/${pack.identity.packageFullName}/${relativeUrl}`;
    return null;
}

async function getPackages(req: Request, res: Response) {
    const packages = {};
    for (const item of PackageRegistry.packages) {
        const copy = structuredClone(item);
        copy.path = "/packages/" + path.basename(item.path);

        for (const id in copy.applications) {
            const app = copy.applications[id];

            // app.entryPoint = fixupUrl(item, app.entryPoint);
            // app.startPage = fixupUrl(item, app.startPage);
            app.visualElements.splashScreen.image = fixupUrl(item, app.visualElements.splashScreen.image);
            app.visualElements.square30x30Logo = fixupUrl(item, app.visualElements.square30x30Logo);
            app.visualElements.square150x150Logo = fixupUrl(item, app.visualElements.square150x150Logo);
            app.visualElements.defaultTile.square70x70Logo = fixupUrl(item, app.visualElements.defaultTile.square70x70Logo);
            app.visualElements.defaultTile.wide310x150Logo = fixupUrl(item, app.visualElements.defaultTile.wide310x150Logo);
            app.visualElements.defaultTile.square310x310Logo = fixupUrl(item, app.visualElements.defaultTile.square310x310Logo);
        }

        packages[item.identity.packageFamilyName] = copy;
    }

    res.json(packages);
}

export default function registerRoutes(router: Router) {
    router.get('/start-screen.xml', getStartScreen);
    router.get('/packages.json', getPackages);
}