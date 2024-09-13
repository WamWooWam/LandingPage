// import 'dotenv/config'

import { PackageReader } from 'landing-page-shared';
import PackageRegistry from './PackageRegistry';
import error from './middleware/error';
import logging from "./middleware/logging"
import registerBlueSky from './controllers/tiles/bluesky';
import registerConfiguration from './controllers/tiles/configuration';
import registerGithub from './controllers/tiles/github';
import registerMisskeyInstance from './controllers/tiles/misskey';
import registerOpenGraphImages from './controllers/images/opengraph';
import registerPeopleTiles from './controllers/tiles/people';
import registerRoutes from './controllers';
import registerStandaloneManifests from './controllers/standalone/manifest';
import registerTiles from './controllers/images/tiles';
import registerTwitch from './controllers/tiles/twitch';
import registerTwitter from './controllers/tiles/nitter';
import registerYouTube from './controllers/tiles/youtube';

import express = require('express');
import path = require('path');
import fsp = require('fs/promises');
import apicache = require('apicache');
import xmldom = require('xmldom');


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


const app = express();
(async () => {
    // load all packages
    const packages = await fsp.readdir('../packages');
    for (let packageName of packages) {
        // if this is a directory, it's a package
        const stat = await fsp.stat(`../packages/${packageName}`);
        if (!stat.isDirectory()) continue;

        try {
            const appxManifest = await fsp.readFile(`../packages/${packageName}/AppxManifest.xml`, 'utf-8');
            const parser = new PackageReader(appxManifest, new xmldom.DOMParser);
            const manifest = await parser.readPackage();

            PackageRegistry.registerPackage(manifest);
        }
        catch (e) {
            console.error(`Error reading package ${packageName}:`, e);
        }
    }

    const staticDirectory = path.join(process.cwd(), '../frontend/dist');

    app.set('view engine', 'hbs');
    app.set('views', path.join(process.cwd(), '../frontend/dist/views'));

    app.use(logging);

    const apiRouter = express.Router();
    app.use('/api', apiRouter);

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

    app.use(express.static(staticDirectory, { index: false, maxAge: '90d' }));

    registerRoutes(app);

    app.use(error)

    app.listen(process.env.PORT || 5001);
})();