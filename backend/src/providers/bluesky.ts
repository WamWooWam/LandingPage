import { AppBskyEmbedImages, AppBskyFeedPost, BskyAgent } from "@atproto/api";
import { EXT_XMLNS, createBindingFromTemplate, createRoot, createVisual } from "./utils";
import { Request, Response } from "express";

import { TileTemplateType } from "../TileTemplateType";
import { XMLSerializer } from "xmldom";
import { XRPCError } from "@atproto/xrpc";

export namespace Bluesky {
    const bskyUsername = process.env.BLUESKY_USERNAME;
    const bskyPassword = process.env.BLUESKY_APP_PASSWORD;

    const agent = new BskyAgent({ service: "https://bsky.social" });

    export async function initialize() {
        try {
            await agent.login({ identifier: bskyUsername, password: bskyPassword });
        }
        catch (e) {
        }
    }

    export async function latestPosts(req: Request, res: Response) {
        const feed = await agent.getAuthorFeed({ actor: bskyUsername });
        if (!feed.success) {
            res.status(204);
        }

        const root = createRoot();

        // take the first 10 posts
        const posts = feed.data.feed.slice(0, 10);
        for (const data of posts) {
            const visual = createVisual(root);
            const author = data.post.author;
            const record = data.post.record as AppBskyFeedPost.Record;

            if (data.post.embed?.$type === 'app.bsky.embed.images#view') {
                const embed = data.post.embed as AppBskyEmbedImages.View;
                const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquarePeekImageAndText04);
                content.getElementsByTagName("image")[0].setAttribute("src", embed.images[0].thumb);
                content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", embed.images[0].alt);
                content.getElementsByTagName("text")[0].textContent = record.text;

                let wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWidePeekImage05);
                if (record.text.length) {
                    wideContent.getElementsByTagName("image")[1].setAttribute("src", author.avatar);
                    wideContent.getElementsByTagName("image")[1].setAttributeNS(EXT_XMLNS, "ext:alt", author.displayName + " profile picture");
                    wideContent.getElementsByTagName("text")[1].textContent = record.text;
                }
                else {
                    wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWide310x150Image);
                }

                wideContent.getElementsByTagName("image")[0].setAttribute("src", embed.images[0].thumb);
                wideContent.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", embed.images[0].alt);
            }
            else {
                const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare150x150Text04);
                content.getElementsByTagName("text")[0].textContent = record.text;

                const wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWideSmallImageAndText03);
                wideContent.getElementsByTagName("image")[0].setAttribute("src", author.avatar);
                wideContent.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", author.displayName + " profile picture");
                wideContent.getElementsByTagName("text")[0].textContent = record.text;
            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }
}