import 'dotenv/config'

import express from 'express';
import path from 'path'
import apicache from 'apicache'

import { Twitter } from './providers/twitter';
import { Snug } from './providers/snug';
import { Twitch } from './providers/twitch';
import { YouTube } from './providers/youtube';
import { GitHub } from './providers/github';

const app = express();

(async () => {
    app.get('/api/live-tiles/twitter/latest-tweets.xml', apicache.middleware('10 minutes'), Twitter.latestTweets);
    app.get('/api/live-tiles/snug/latest-notes.xml', apicache.middleware('10 minutes'), Snug.latestNotes);
    app.get('/api/live-tiles/twitch/is-live.xml', apicache.middleware('10 minutes'), Twitch.isLive);
    app.get('/api/live-tiles/youtube/recent-videos.xml', apicache.middleware('10 minutes'), YouTube.recentVideos);
    app.get('/api/live-tiles/github/recent-activity.xml', apicache.middleware('10 minutes'), GitHub.recentActivity);

    app.use(express.static(path.join(process.cwd(), "client", "dist")))
    app.get('/', (req, res) => {
        res.sendFile(path.join(process.cwd(), "client", "dist", "index.html"))
    });

    app.use((err, req, res, next) => {
        console.error(err.stack)
        res.status(500).contentType('text/plain').send('Something went wrong! Please try again later.')
    })

    app.listen(5001);
})();