import 'dotenv/config'

import * as express from 'express';
import * as path from 'path'
import * as apicache from 'apicache'
import * as fs from 'fs'
import * as fsp from 'fs/promises'

import PackageRegistry from './PackageRegistry';

import { Twitter } from './providers/twitter';
import { Snug } from './providers/snug';
import { Twitch } from './providers/twitch';
import { YouTube } from './providers/youtube';
import { GitHub } from './providers/github';
import { Thumbnail } from './providers/thumbnail';
import { PackageReader } from 'landing-page-shared';
import { Images } from './providers/images/tiles';
import { Standalone } from './providers/standalone/manifest';
import { Configuration } from './providers/configuration';

globalThis.DOMParser = require('xmldom').DOMParser; // BUGBUG: hacky fix to stop webpack including xmldom in the client bundle

const app = express();

(async () => {
    const packages = await fsp.readdir('../packages');
    for (let packageName of packages) {
        try {
            const appxManifest = await fsp.readFile(`../packages/${packageName}/AppxManifest.xml`, 'utf-8');
            let parser = new PackageReader(appxManifest, new DOMParser());
            let manifest = await parser.readPackage();
            PackageRegistry.registerPackage(manifest);
        }
        catch (e) {
        }
    }

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

    app.get('/api/live-tiles/twitter/latest-tweets.xml', apicache.middleware('1 hour'), Twitter.latestTweets);
    app.get('/api/live-tiles/snug/latest-notes.xml', apicache.middleware('15 minutes'), Snug.latestNotes);
    app.get('/api/live-tiles/twitch/is-live.xml', apicache.middleware('15 minutes'), Twitch.isLive);
    app.get('/api/live-tiles/youtube/recent-videos.xml', apicache.middleware('15 minutes'), YouTube.recentVideos);
    app.get('/api/live-tiles/github/recent-activity.xml', apicache.middleware('15 minutes'), GitHub.recentActivity);

    app.get('/api/media/og-image.svg', apicache.middleware('14 days'), (req, res) => {
        res.sendFile(path.join(process.cwd(), "images/og-image.svg"));
    });
    app.get('/api/media/og-image.png', apicache.middleware('14 days'), (req, res) => {
        res.sendFile(path.join(process.cwd(), "images/og-image.png"));
    });

    app.get('/api/media/:type/:package/:app/:size?', apicache.middleware('14 days'), Images.getImage);
    app.get('/api/manifest/:package/:app', apicache.middleware('14 days'), Standalone.Manifest.getManifest);
    app.get('/api/msapplication-config/:package/:app', apicache.middleware('14 days'), Standalone.Manifest.getApplicationConfig);

    app.get('/api/configuration', Configuration.getConfiguration);

    app.use(express.static(path.join(process.cwd(), "..", "frontend", "dist"), { index: false, maxAge: '90d' }));
    app.get('/', (req, res) => {
        res.render('index');
    });

    app.get('/app/:package/:id', (req, res) => {
        let pack = PackageRegistry.getPackage(req.params.package);
        if (!pack) {
            res.status(404).send('Not found!');
            return;
        }

        // make sure we're not doing prototype pollution
        if (req.params.id.startsWith('__proto__') || req.params.id.startsWith('constructor')) {
            res.status(404).send('Not found!');
            return;
        }

        let app = pack.applications[req.params.id];
        if (!app) {
            res.status(404).send('Not found!');
            return;
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
            applicationConfig: `/api/msapplication-config/${req.params.package}/${req.params.id}`
        }

        res.render('standalone', data);
    });

    app.use(async (err, req, res, next) => {
        console.error(err)
        if (process.env.NODE_ENV === 'development') {
            let error = err;
            if (err instanceof Error) {
                error = err.stack;
            }
            if (err.then) {
                error = await Promise.resolve(err).catch(e => e.stack);
            }

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