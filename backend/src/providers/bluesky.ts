import { AppBskyEmbedImages, AppBskyFeedPost, BskyAgent } from "@atproto/api";
import { Request, Response } from "express";
import { EXT_XMLNS, createBindingFromTemplate, createRoot, createVisual } from "./utils";
import { TileTemplateType } from "../TileTemplateType";
import { XMLSerializer } from "xmldom";

export namespace Bluesky {
    const bskyUsername = process.env.BLUESKY_USERNAME;
    const bskyPassword = process.env.BLUESKY_APP_PASSWORD;

    const agent = new BskyAgent({ service: "https://bsky.social" });

    export async function initialize() {
        await agent.login({ identifier: bskyUsername, password: bskyPassword });
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

                const wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWidePeekImage05);
                wideContent.getElementsByTagName("image")[0].setAttribute("src", embed.images[0].thumb);
                wideContent.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", embed.images[0].alt);
                wideContent.getElementsByTagName("image")[1].setAttribute("src", author.avatar);
                wideContent.getElementsByTagName("image")[1].setAttributeNS(EXT_XMLNS, "ext:alt", author.displayName + " profile picture");
                wideContent.getElementsByTagName("text")[1].textContent = record.text;
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