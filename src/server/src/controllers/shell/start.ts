import { Request, Response, Router } from 'express';

import PackageRegistry from '../../PackageRegistry';
import path from 'path';
import fs from 'fs/promises';

import { minify } from 'minify-xml';

import { fixupUrl } from '../../utils';
import { Package } from '@landing-page/shared';

export async function startScreen() {
    const startScreenPath = require.resolve("../../../config/StartScreen.xml");
    return minify(await fs.readFile(startScreenPath, 'utf-8'));
}

export async function packages(): Promise<Record<string, Package>> {
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
    return packages;
}


async function getStartScreen(req: Request, res: Response) {
    const xml = await startScreen();

    res.contentType("application/xml")
        .send(xml);
}

async function getPackages(req: Request, res: Response) {
    const packs = await packages();
    res.json(packs);
}

export default function registerRoutes(router: Router) {
    router.get('/start-screen.xml', getStartScreen);
    router.get('/packages.json', getPackages);
}