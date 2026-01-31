import 'dotenv/config'

import { DOMParser } from 'xmldom';
import { PackageReader } from '@landing-page/shared';
import PackageRegistry from './PackageRegistry';

import error from './middleware/error';
import logging from "./middleware/logging"

import registerApps from './controllers/apps/shortlinks';
import registerBlueSky from './controllers/tiles/bluesky';
import registerConfiguration from './controllers/tiles/configuration';
import registerGithub from './controllers/tiles/github';
import registerMisskeyInstance from './controllers/tiles/misskey';
import registerOpenGraphImages from './controllers/images/opengraph';
import registerPeopleTiles from './controllers/tiles/people';
import registerRoutes from './controllers';
import registerStandaloneManifests from './controllers/standalone/manifest';
import registerStart from './controllers/shell/start';
import registerTiles from './controllers/images/tiles';
import registerTwitch from './controllers/tiles/twitch';
import registerTwitter from './controllers/tiles/nitter';
import registerYouTube from './controllers/tiles/youtube';
import registerOld from './controllers/old';

import express = require('express');
import path = require('path');
import fsp = require('fs/promises');
import apicache = require('apicache');

const cache = (() => {
    return apicache.options({
        debug: process.env.NODE_ENV === 'development',
        respectCacheControl: false,
        statusCodes: {
            include: [200, 204],
            exclude: [400, 401, 404, 500]
        }
    }).middleware;
})()

const APP_PACKAGES = [
    "@landing-page/app-calculator",
    "@landing-page/app-calculator",
    "@landing-page/app-friends",
    "@landing-page/app-games",
    "@landing-page/app-projects",
    "@landing-page/app-settings",
    "@landing-page/app-socials",
]

const app = express();
(async () => {
    for (const appPackages of APP_PACKAGES) {
        const dirName = path.dirname(require.resolve(appPackages + "/AppxManifest.xml"));
        const manifest = await fsp.readFile(path.join(dirName, 'AppxManifest.xml'), 'utf8');
        const reader = new PackageReader(manifest, new DOMParser(), (url) => url);
        const pack = await reader.readPackage();
        pack.path = dirName;

        PackageRegistry.registerPackage(pack);
    }

    const staticDirectory = path.dirname(require.resolve("@landing-page/shell"));
    const packagesDirectory = path.join(__dirname, '..', 'packages');

    app.set('view engine', 'hbs');
    app.set('views', path.join(staticDirectory));

    app.use(logging);

    const apiRouter = express.Router();
    app.use('/api', apiRouter);

    registerStart(apiRouter);

    const liveTilesRouter = express.Router({ mergeParams: true });
    apiRouter.use('/live-tiles', cache('1 hour'), liveTilesRouter);

    registerYouTube(liveTilesRouter);
    registerBlueSky(liveTilesRouter);
    registerTwitch(liveTilesRouter);
    registerTwitter(liveTilesRouter);
    registerGithub(liveTilesRouter);

    registerMisskeyInstance(liveTilesRouter, process.env.SNUG_NAME, process.env.SNUG_BASE_URL, process.env.SNUG_USER_ID);

    registerPeopleTiles(liveTilesRouter);

    const mediaRouter = express.Router({ mergeParams: true });
    apiRouter.use('/media', cache('90 days'), mediaRouter);

    registerTiles(mediaRouter);
    registerOpenGraphImages(mediaRouter);

    registerStandaloneManifests(apiRouter);
    registerConfiguration(apiRouter);

    const packagesRouter = express.Router();
    app.use('/packages', packagesRouter);

    for (const pack of PackageRegistry.packages) {
        packagesRouter.use(`/${pack.identity.packageFullName}`, express.static(pack.path, { index: false, maxAge: '90d' }))
    }

    app.use(express.static(staticDirectory, { index: false, maxAge: '90d' }));

    registerOld(app);

    registerApps(app);

    registerRoutes(app);

    app.use(error)

    app.listen(process.env.PORT || 5001);
})();