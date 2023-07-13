import 'dotenv/config'

import express from 'express';
import path from 'path'
import apicache from 'apicache'

import { Twitter } from './providers/twitter';
import { Snug } from './providers/snug';
import { Twitch } from './providers/twitch';
import { YouTube } from './providers/youtube';
import { GitHub } from './providers/github';
import { Thumbnail } from './providers/thumbnail';

globalThis.DOMParser = require('xmldom').DOMParser; // hacky fix to stop webpack including xmldom in the client bundle

const app = express();

(async () => {
    app.get('/api/live-tiles/twitter/latest-tweets.xml', apicache.middleware('1 hour'), Twitter.latestTweets);
    app.get('/api/live-tiles/snug/latest-notes.xml', apicache.middleware('15 minutes'), Snug.latestNotes);
    app.get('/api/live-tiles/twitch/is-live.xml', apicache.middleware('15 minutes'), Twitch.isLive);
    app.get('/api/live-tiles/youtube/recent-videos.xml', apicache.middleware('15 minutes'), YouTube.recentVideos);
    app.get('/api/live-tiles/github/recent-activity.xml', apicache.middleware('15 minutes'), GitHub.recentActivity);

    app.get('/api/media/og-image.svg', apicache.middleware('30 days'), Thumbnail.generateThumbnailSvg);
    app.get('/api/media/og-image.png', apicache.middleware('30 days'), Thumbnail.generateThumbnailPng);

    app.use(express.static(path.join(process.cwd(), "client", "dist")))
    app.get('/', (req, res) => {
        res.sendFile(path.join(process.cwd(), "client", "dist", "index.html"))
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

    app.listen(5001);
})();