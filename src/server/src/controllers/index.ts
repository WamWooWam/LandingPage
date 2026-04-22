import * as fs from "fs";

import { NextFunction, Request, Response, Router } from "express";
import { StartTileGroup, TileSize, parseLayout } from "@landing-page/shared";

import PackageRegistry from "../PackageRegistry";

import xmldom from "xmldom";
import { fixupUrl } from "../utils";
import { packages, startScreen } from "./shell/start";
import { getConfig } from "./tiles/configuration";

const index = async (req: Request, res: Response) => {
    let data = {} as any;
    const { urls, startLayout, packages } = await generatePreload();
    data.preload = urls;
    data.startLayout = startLayout;
    data.packages = JSON.stringify(packages);
    data.configuration = JSON.stringify(getConfig());

    if (process.env.NODE_ENV === 'production') {
        data.UMAMI_URL = process.env.UMAMI_URL;
        data.UMAMI_ID = process.env.UMAMI_ID
    }

    res.render('index', data);
}

const standaloneApp = async (req: Request, res: Response, next: NextFunction) => {
    let pack = PackageRegistry.getPackage(req.params.package);
    if (!pack) {
        return next();
    }

    let app = pack.applications!.get(req.params.id);
    if (!app) {
        return next();
    }

    // if the app has a start page, redirect to it instead of showing the standalone page
    if (app.startPage && app.startPage.startsWith('http')) {
        res.redirect(app.startPage);
        return;
    }

    const configuration = await getConfig();
    const startLayoutXml = await startScreen();
    const packs = await packages();

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
        packages: JSON.stringify(packs),
        preload: [
            app.visualElements.splashScreen.image
        ]
    } as any;

    if (process.env.NODE_ENV === 'production') {
        data.UMAMI_URL = process.env.UMAMI_URL;
        data.UMAMI_ID = process.env.UMAMI_ID
    }

    res.render('standalone', data);
}

const generatePreload = async () => {
    const urls: string[] = [];

    const packs = await packages();
    const startLayout = await startScreen();
    const layout = parseLayout(startLayout, xmldom.DOMParser)
        .flatMap(g => g.tiles);

    for (let tile of layout) {
        if (urls.length > 10)
            break

        if (tile.packageName) {
            const pack = PackageRegistry.getPackage(tile.packageName);
            if (!pack) continue;

            const app = pack.applications!.get(tile.appId);
            if (!app) continue;

            const preloadUrls: string[] = [];

            switch (tile.size) {
                case TileSize.square70x70:
                    preloadUrls.push(app.visualElements.defaultTile.square70x70Logo!);
                    break;
                case TileSize.wide310x150:
                    preloadUrls.push(app.visualElements.defaultTile.wide310x150Logo!);
                    break;
                case TileSize.square310x310:
                    preloadUrls.push(app.visualElements.defaultTile.square310x310Logo!);
                    break;
                default:
                case TileSize.square150x150:
                    preloadUrls.push(app.visualElements.square150x150Logo);
                    break;
            }

            if (app.visualElements.defaultTile.tileUpdateUrl) {
                preloadUrls.push(app.visualElements.square30x30Logo);
            }

            urls.push(...preloadUrls.map(u => fixupUrl(pack, u)!));
        }
    }

    return { urls, startLayout, packages: packs };
}

export default function registerRoutes(router: Router) {
    router.get('/app/:package/:id', standaloneApp);
    router.get('/mobile', index);
    router.get('/', index);
}