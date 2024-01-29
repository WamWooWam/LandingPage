import { Request, Response } from "express";
import { createBindingFromTemplate, createRoot, createVisual } from "./utils";

import { JSDOM } from "jsdom"
import { TileTemplateType } from "../TileTemplateType";
import { XMLSerializer } from "xmldom";

export namespace Nitter {
    const NITTER_INSTANCES = [
        "nitter.catsarch.com",
    ]

    const TWITTER_USERNAME = process.env.TWITTER_USERNAME;

    export async function latestTweets(req: Request, resp: Response) {
        const tweets = await parseTweets();

        const root = createRoot();

        // take the first 25 posts
        const posts = tweets.slice(0, 25);
        for (const tweet of posts) {
            const visual = createVisual(root);

            if (tweet.attachments.length) {
                const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquarePeekImageAndText04);
                content.getElementsByTagName("image")[0].setAttribute("src", tweet.attachments[0].url);
                if (tweet.attachments[0].alt)
                    content.getElementsByTagName("image")[0].setAttribute("alt", tweet.attachments[0].alt);
                content.getElementsByTagName("text")[0].textContent = tweet.content;

                let wideContent = null;
                if (tweet.content.length) {
                    wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWide310x150PeekImage07);
                    wideContent.getElementsByTagName("image")[1].setAttribute("src", tweet.avatar);
                    wideContent.getElementsByTagName("image")[1].setAttribute("alt", tweet.displayName + " profile picture");
                    wideContent.getElementsByTagName("text")[0].textContent = tweet.content;
                }
                else {
                    wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWide310x150Image);
                }

                wideContent.getElementsByTagName("image")[0].setAttribute("src", tweet.attachments[0].url);
                wideContent.getElementsByTagName("image")[0].setAttribute("alt", tweet.attachments[0].alt);
            }
            else {
                const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare150x150Text04);
                content.getElementsByTagName("text")[0].textContent = tweet.content;

                const wideContent = createBindingFromTemplate(root, visual, TileTemplateType.tileWideSmallImageAndText03);
                wideContent.getElementsByTagName("image")[0].setAttribute("src", tweet.avatar);
                wideContent.getElementsByTagName("image")[0].setAttribute("alt", tweet.displayName + " profile picture");
                wideContent.getElementsByTagName("text")[0].textContent = tweet.content;
            }
        }

        resp.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }

    interface Tweet {
        avatar: string;
        displayName: string;
        username: string;
        content: string;
        stats: {
            replies: number;
            retweets: number;
            quoteTweets: number;
            likes: number;
        },
        attachments: {
            url: string;
            alt: string;
        }[]
    }

    async function parseTweets(): Promise<Tweet[]> {
        let domain = NITTER_INSTANCES[Math.floor(Math.random() * NITTER_INSTANCES.length)];
        let response = await fetch(`https://${domain}/${TWITTER_USERNAME}`);
        let html = await response.text();

        const document = new JSDOM(html).window.document;
        const timelineItems = document.querySelectorAll(".timeline-item");
        const tweets = [];

        for (const item of timelineItems) {
            const tweetHeader = item.querySelector(".tweet-header");
            const tweetContent = item.querySelector(".tweet-content");
            const tweetStats = item.querySelector(".tweet-stats");

            const attachmentsElement = item.querySelector(".attachments");
            const attachments = [];
            if (attachmentsElement) {
                const attachmentElements = attachmentsElement.querySelectorAll(".attachment");
                for (const attachmentElement of attachmentElements) {
                    const image = attachmentElement.querySelector("img");
                    const video = attachmentElement.querySelector("video");

                    if (image) {
                        attachments.push({
                            url: fixUrl(image.getAttribute("src")),
                            alt: image.getAttribute("alt"),
                        })
                    }
                    else if (video) {
                        attachments.push({
                            url: fixUrl(video.getAttribute("poster")),
                            alt: video.getAttribute("alt"),
                        })
                    }
                }
            }

            const repliesElement = tweetStats.querySelector(".icon-comment").nextSibling;
            const retweetsElement = tweetStats.querySelector(".icon-retweet").nextSibling;
            const quoteTweetsElement = tweetStats.querySelector(".icon-quote").nextSibling;
            const likesElement = tweetStats.querySelector(".icon-heart").nextSibling;

            const tweet = {
                avatar: fixUrl(tweetHeader.querySelector(".avatar").getAttribute("src")),
                displayName: tweetHeader.querySelector(".fullname").textContent,
                username: tweetHeader.querySelector(".username").textContent,
                content: tweetContent.textContent,
                stats: {
                    replies: parseInt(repliesElement?.textContent || "0"),
                    retweets: parseInt(retweetsElement?.textContent || "0"),
                    quoteTweets: parseInt(quoteTweetsElement?.textContent || "0"),
                    likes: parseInt(likesElement?.textContent || "0"),
                },
                attachments
            }

            tweets.push(tweet);
        }

        return tweets;
    }

    function fixUrl(url: string) {
        if (url.startsWith("/pic")) {
            // the real url is after the first slash

            let index = url.indexOf("/", 1);
            if (index === -1) {
                return url;
            }

            let mediaUrl = decodeURIComponent(url.substring(index));
            return `https://pbs.twimg.com${mediaUrl}`;
        }
    }
}