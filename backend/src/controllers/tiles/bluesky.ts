import { AppBskyEmbedImages, AppBskyFeedPost, BskyAgent } from '@atproto/api';
import {
    EXT_XMLNS,
    createBindingFromTemplate,
    createRoot,
    createVisual,
} from '../../utils';
import { Request, Response, Router } from 'express';

import { TileTemplateType } from '../../TileTemplateType';
import { XMLSerializer } from 'xmldom';
import { XRPCError } from '@atproto/xrpc';

const bskyUsername = process.env.BLUESKY_USERNAME;
const bskyPassword = process.env.BLUESKY_APP_PASSWORD;

const agent = new BskyAgent({ service: 'https://bsky.social' });

let initialized = false;
async function initialize() {
    if (initialized) return true;
    initialized = true;

    try {
        setInterval(
            async () => {
                await agent
                    .login({ identifier: bskyUsername, password: bskyPassword })
                    .catch((e: XRPCError) => console.error(e));
            },
            1000 * 60 * 60 * 24,
        );

        await agent.login({ identifier: bskyUsername, password: bskyPassword });
        return true;
    } catch (e) {
        return false;
    }
}

async function latestPosts(req: Request, res: Response) {
    await initialize();

    const feed = await agent.getAuthorFeed({ actor: bskyUsername });
    const root = createRoot();

    // take the first 25 posts
    const posts = feed.data.feed.slice(0, 25);
    for (const data of posts) {
        const visual = createVisual(root);
        const author = data.post.author;
        const record = data.post.record as AppBskyFeedPost.Record;

        if (data.post.embed?.$type === 'app.bsky.embed.images#view') {
            const embed = data.post.embed as AppBskyEmbedImages.View;
            const content = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileSquarePeekImageAndText04,
            );
            content
                .getElementsByTagName('image')[0]
                .setAttribute('src', embed.images[0].thumb);
            content
                .getElementsByTagName('image')[0]
                .setAttribute('alt', embed.images[0].alt);
            content.getElementsByTagName('text')[0].textContent = record.text;

            let wideContent = null;
            if (record.text.length) {
                wideContent = createBindingFromTemplate(
                    root,
                    visual,
                    TileTemplateType.tileWide310x150PeekImage07,
                );
                wideContent
                    .getElementsByTagName('image')[1]
                    .setAttribute('src', author.avatar);
                wideContent
                    .getElementsByTagName('image')[1]
                    .setAttribute(
                        'alt',
                        author.displayName + ' profile picture',
                    );
                wideContent.getElementsByTagName('text')[0].textContent =
                    record.text;
            } else {
                wideContent = createBindingFromTemplate(
                    root,
                    visual,
                    TileTemplateType.tileWide310x150Image,
                );
            }

            wideContent
                .getElementsByTagName('image')[0]
                .setAttribute('src', embed.images[0].thumb);
            wideContent
                .getElementsByTagName('image')[0]
                .setAttribute('alt', embed.images[0].alt);
        } else {
            const content = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileSquare150x150Text04,
            );
            content.getElementsByTagName('text')[0].textContent = record.text;

            const wideContent = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileWideSmallImageAndText03,
            );
            wideContent
                .getElementsByTagName('image')[0]
                .setAttribute('src', author.avatar);
            wideContent
                .getElementsByTagName('image')[0]
                .setAttribute('alt', author.displayName + ' profile picture');
            wideContent.getElementsByTagName('text')[0].textContent =
                record.text;
        }
    }

    res.contentType('application/xml').send(
        new XMLSerializer().serializeToString(root),
    );
}

export default function registerRoutes(router: Router) {
    router.get('/bluesky/latest-posts.xml', latestPosts);
}
