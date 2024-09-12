import * as fs from "fs";

import { NextFunction, Request, Response, Router } from "express";
import { StartTileGroup, TileSize, parseLayout } from "landing-page-shared";

import PackageRegistry from "../PackageRegistry";

import xmldom = require("xmldom");

const index = (req: Request, res: Response) => {
    res.render('index');
}

const standaloneApp = (req: Request, res: Response, next: NextFunction) => {
    let pack = PackageRegistry.getPackage(req.params.package);
    if (!pack) {
        return next();
    }

    // make sure we're not doing prototype pollution
    if (req.params.id.startsWith('__proto__') || req.params.id.startsWith('constructor')) {
        return next();
    }

    let app = pack.applications[req.params.id];
    if (!app) {
        return next();
    }

    // if the app has a start page, redirect to it instead of showing the standalone page
    if (app.startPage && app.startPage.startsWith('http')) {
        res.redirect(app.startPage);
        return;
    }

    const plated = `/api/media/plated/${req.params.package}/${req.params.id}`;
    const data = {
        title: app.visualElements.displayName,
        description: app.visualElements.description,
        themeColor: app.visualElements.backgroundColor,
        ogImage: `${plated}/splash`,
        square30x30logo: `${plated}/square30x30logo`,
        square70x70logo: `${plated}/square70x70logo`,
        square150x150logo: `${plated}/square150x150logo`,
        square310x310logo: `${plated}/square310x310logo`,
        wide310x150logo: `${plated}/wide310x150logo`,
        splashScreen: `${plated}/splash`,
        appleTouchIcon: `${plated}/apple-touch-icon`,
        manifest: `/api/manifest/${req.params.package}/${req.params.id}`,
        applicationConfig: `/api/msapplication-config/${req.params.package}/${req.params.id}`,
        preload: [
            app.visualElements.splashScreen.image
        ]
    }

    res.render('standalone', data);
}

const generatePreload = async () => {
    const preloadUrls: string[] = [];

    const startLayout = await fs.promises.readFile('../packages/StartScreen.xml', 'utf-8');
    const layout = parseLayout(startLayout, xmldom.DOMParser)
        .flatMap(g => g.tiles);

    for (let tile of layout) {
        if (tile.packageName) {
            const pack = PackageRegistry.getPackage(tile.packageName);
            if (!pack) continue;

            const app = pack.applications[tile.appId];
            if (!app) continue;

            switch (tile.size) {
                case TileSize.square70x70:
                    preloadUrls.push(app.visualElements.defaultTile.square70x70Logo);
                    break;
                case TileSize.wide310x150:
                    preloadUrls.push(app.visualElements.defaultTile.wide310x150Logo);
                    break;
                case TileSize.square310x310:
                    preloadUrls.push(app.visualElements.defaultTile.square310x310Logo);
                    break;
                default:
                case TileSize.square150x150:
                    preloadUrls.push(app.visualElements.square150x150Logo);
                    break;
            }

            if (app.entryPoint) {
                preloadUrls.push(app.visualElements.square30x30Logo);
                preloadUrls.push(app.visualElements.splashScreen.image);
            }
            else if (app.visualElements.defaultTile.tileUpdateUrl) {
                preloadUrls.push(app.visualElements.square30x30Logo);
            }
        }
    }

    return preloadUrls;
}

export default function registerRoutes(router: Router) {
    router.get('/app/:package/:id', standaloneApp);
    router.get('/mobile', index);
    router.get('/', index);
}