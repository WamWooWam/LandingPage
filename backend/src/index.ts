import 'dotenv/config'

import { Handler, NextFunction, Request, Response } from 'express';
import { PackageReader, StartTileGroup, TileSize, parseLayout } from 'landing-page-shared';

import { Bluesky } from './providers/bluesky';
import { Configuration } from './providers/configuration';
import { GitHub } from './providers/github';
import { Nitter } from './providers/nitter';
import PackageRegistry from './PackageRegistry';
import { Snug } from './providers/snug';
import { Standalone } from './providers/standalone/manifest';
import { Twitch } from './providers/twitch';
import { Twitter } from './providers/twitter';
import { YouTube } from './providers/youtube';
import { render } from 'preact-render-to-string';
import webp from './webp';

import express = require('express');
import path = require('path');
import fsp = require('fs/promises');
import apicache = require('apicache');
import os = require('os');


globalThis.DOMParser = require('xmldom').DOMParser; // BUGBUG: hacky fix to stop webpack including xmldom in the client bundle

const generatePreload = async () => {
    const preloadUrls: string[] = [];

    const startLayout = await fsp.readFile('../packages/StartScreen.xml', 'utf-8');
    const layout = (parseLayout(startLayout, DOMParser) as StartTileGroup[]).flatMap(g => g.tiles);
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

const app = express();

(async () => {
    const packages = await fsp.readdir('../packages');
    for (let packageName of packages) {
        try {
            const appxManifest = await fsp.readFile(`../packages/${packageName}/AppxManifest.xml`, 'utf-8');
            const parser = new PackageReader(appxManifest, new DOMParser());
            const manifest = await parser.readPackage();

            PackageRegistry.registerPackage(manifest);
        }
        catch (e) {
        }
    }

    await Bluesky.initialize();

    const preload = await generatePreload();

    app.set('view engine', 'hbs');
    app.set('views', path.join(process.cwd(), '../frontend/dist/views'));

    app.use((req, res, next) => {
        const time = performance.now();

        next();

        res.on('finish', () => {
            const responseTime = performance.now() - time;
            console.log(`${req.method} ${req.url} => ${res.statusCode} ${res.statusMessage}, ${responseTime.toFixed(2)}ms, ${res.get('Content-Length') || 0} bytes, ${req.get('User-Agent')}`);
        });
    });

    app.get('/api/live-tiles/twitter/latest-tweets.xml', apicache.middleware('1 hour'), Nitter.latestTweets);
    app.get('/api/live-tiles/snug/latest-notes.xml', apicache.middleware('15 minutes'), Snug.latestNotes);
    app.get('/api/live-tiles/twitch/is-live.xml', apicache.middleware('15 minutes'), Twitch.isLive);
    app.get('/api/live-tiles/youtube/recent-videos.xml', apicache.middleware('15 minutes'), YouTube.recentVideos);
    app.get('/api/live-tiles/github/:username/:project.xml', apicache.middleware('15 minutes'), GitHub.recentActivity);
    app.get('/api/live-tiles/bluesky/latest-posts.xml', apicache.middleware('15 minutes'), Bluesky.latestPosts);

    app.get('/api/media/og-image.svg', apicache.middleware('14 days'), (req: Request, res: Response) =>
        res.sendFile(path.join(process.cwd(), "images/og-image.svg")));

    app.get('/api/media/og-image.png', apicache.middleware('14 days'), (req: Request, res: Response) =>
        res.sendFile(path.join(process.cwd(), "images/og-image.png")));

    app.get('/api/media/:type/:package/:app/:size?', apicache.middleware('90 days'), require('./providers/images/tiles').Images.getImage);

    app.get('/api/manifest/:package/:app', apicache.middleware('14 days'), Standalone.Manifest.getManifest);
    app.get('/api/msapplication-config/:package/:app', apicache.middleware('14 days'), Standalone.Manifest.getApplicationConfig);

    app.get('/api/configuration', Configuration.getConfiguration);

    // some browsers dont support webp, so i want to serve pngs to them by converting them on the fly
    app.use(express.static(path.join(process.cwd(), "..", "frontend", "dist"), { index: false, maxAge: '90d' }));

    app.get('/', (req, res) => {
        res.render('index', { preload });
    });

    app.get('/app/:package/:id', (req: Request, res: Response, next: NextFunction) => {
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
    });

    app.use(async (err: Error | Promise<void>, req: Request, res: Response, next: NextFunction) => {
        console.error(err)

        if (process.env.NODE_ENV === 'development') {
            let error: any = err;
            if (err instanceof Error) {
                error = err.stack;
            }

            if ('then' in err && err.then) {
                error = await Promise.resolve(err).catch(e => e.stack);
            }

            if (typeof error !== 'string') error = JSON.stringify(error);

            res.status(500)
                .contentType('text/plain')
                .send(`error: ${error}`)
        }
        else {
            res.status(500)
                .contentType('text/plain')
                .send('Something went wrong! Please try again later.')
        }
    })

    app.listen(process.env.PORT || 5001);
})();