import 'dotenv/config'

import * as express from 'express';
import * as path from 'path'
import * as apicache from 'apicache'
import * as fs from 'fs'
import * as fsp from 'fs/promises'

import { Twitter } from './providers/twitter';
import { Snug } from './providers/snug';
import { Twitch } from './providers/twitch';
import { YouTube } from './providers/youtube';
import { GitHub } from './providers/github';
import { Thumbnail } from './providers/thumbnail';
import { PackageReader } from 'landing-page-shared';
import PackageRegistry from './PackageRegistry';
import { Images } from './providers/images/tiles';
import { Standalone } from './providers/standalone/manifest';

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
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}, ${req.headers['user-agent']}`);        

        next();
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

    app.use(express.static(path.join(process.cwd(), "..", "frontend", "dist")))
    app.get('/', (req, res) => {
        res.sendFile(path.join(process.cwd(), "..", "frontend", "dist", "index.html"))
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

        // ensure the app is loadable
        if (app.startPage && app.startPage.startsWith('http')) {
            // redirect to the start page
            res.redirect(app.startPage);
            return;
        }

        let file = path.join(process.cwd(), "..", "frontend", "dist", "standalone.html");
        fs.readFile(file, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('Something went wrong! Please try again later.');
                return;
            }

            let result = data.replace(/{{title}}/g, app.visualElements.displayName)
                .replace(/{{description}}/g, app.visualElements.description)
                .replace(/{{theme-color}}/g, app.visualElements.backgroundColor)
                .replace(/{{og-image}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/splash`)
                .replace(/{{square30x30logo}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/square30x30logo`)
                .replace(/{{square70x70logo}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/square70x70logo`)
                .replace(/{{square150x150logo}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/square150x150logo`)
                .replace(/{{square310x310logo}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/square310x310logo`)
                .replace(/{{wide310x150logo}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/wide310x150logo`)
                .replace(/{{apple-touch-icon}}/g, `/api/media/plated/${req.params.package}/${req.params.id}/apple-touch-icon`)
                .replace(/{{manifest}}/g, `/api/manifest/${req.params.package}/${req.params.id}`)
                .replace(/{{application-config}}/g, `/api/msapplication-config/${req.params.package}/${req.params.id}`);

            res.contentType('text/html').send(result);
        });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack)
        if (process.env.NODE_ENV === 'development') {
            res.status(500)
                .contentType('text/plain')
                .send(err.stack)
        }
        else {
            res.status(500)
                .contentType('text/plain')
                .send('Something went wrong! Please try again later.')
        }
    })

    app.listen(process.env.PORT || 5001);
})();