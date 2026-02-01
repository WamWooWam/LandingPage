import { Request, Response, Router } from 'express';

import PackageRegistry from '../../PackageRegistry';
import path from 'path';

import { fixupUrl } from '../../utils';

async function getStartScreen(req: Request, res: Response) {
    res.contentType("application/xml")
        .sendFile(path.resolve(__dirname, "../../../config/StartScreen.xml"));
}

async function getPackages(req: Request, res: Response) {
    const packages = {};
    for (const item of PackageRegistry.packages) {
        const copy = structuredClone(item);
        copy.path = "/packages/" + path.basename(item.path);

        for (const [id, app] of copy.applications.entries()) {
            app.entryPoint = fixupUrl(item, app.entryPoint);
            app.startPage = fixupUrl(item, app.startPage);
            app.executable = fixupUrl(item, app.executable);
            app.visualElements.splashScreen.image = fixupUrl(item, app.visualElements.splashScreen.image);
            app.visualElements.square30x30Logo = fixupUrl(item, app.visualElements.square30x30Logo);
            app.visualElements.square150x150Logo = fixupUrl(item, app.visualElements.square150x150Logo);
            app.visualElements.defaultTile.square70x70Logo = fixupUrl(item, app.visualElements.defaultTile.square70x70Logo);
            app.visualElements.defaultTile.wide310x150Logo = fixupUrl(item, app.visualElements.defaultTile.wide310x150Logo);
            app.visualElements.defaultTile.square310x310Logo = fixupUrl(item, app.visualElements.defaultTile.square310x310Logo);
            copy.applications[id] = app;
        }

        packages[item.identity.packageFamilyName] = copy;
    }

    res.json(packages);
}

export default function registerRoutes(router: Router) {
    router.get('/start-screen.xml', getStartScreen);
    router.get('/packages.json', getPackages);
}