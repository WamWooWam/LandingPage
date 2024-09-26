import { Request, Response, Router } from "express";
import { createBindingFromTemplate, createRoot, createVisual } from "../../utils";

import { JSDOM } from "jsdom"
import { TileTemplateType } from "../../TileTemplateType";
import { XMLSerializer } from "xmldom";

const NITTER_INSTANCES = [
    "nitter.esmailelbob.xyz",
]

const TWITTER_USERNAME = process.env.TWITTER_USERNAME;

export async function latestTweets(req: Request, resp: Response) {
    const tweets = await parseTweets();

    const root = createRoot();

    // take the first 25 posts
    const posts = tweets.slice(0, 25);
    for (const tweet of posts) {
        if (tweet.isRetweet) continue;

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
    }[],
    isRetweet: boolean;
}

async function parseTweets(): Promise<Tweet[]> {
    // so we need to failover to another instance if the first one fails
    let tweets: Tweet[] = [];
    for (const instance of NITTER_INSTANCES) {
        try {
            tweets = await parseTweetsFromInstance(instance);
            break;
        }
        catch (e) {
            console.error(e);
        }
    }

    return tweets;
}

async function parseTweetsFromInstance(domain: string): Promise<Tweet[]> {
    let response = await fetch(`https://${domain}/${TWITTER_USERNAME}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) KHTML, like Gecko Chrome/83.0.4103.116 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Upgrade-Insecure-Requests": "1",
        }
    });

    if (!response.ok)
        throw new Error(`Failed to fetch tweets from ${domain}: ${response.status} ${response.statusText}`);

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

        const isRetweet = item.querySelector(".retweet-header") !== null;

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
            attachments,
            isRetweet,
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

        let mediaUrl = '';
        url = url.substring(index);
        if (url.startsWith("/enc")) {
            // the real url is after the second slash

            index = url.indexOf("/", 1);
            if (index === -1) {
                return url;
            }

            url = url.substring(index + 1);

            mediaUrl = '/' + atob(url);
        }
        else {
            mediaUrl = decodeURIComponent(url);
        }

        return `https://pbs.twimg.com${mediaUrl}`;
    }
}

export default function registerRoutes(router: Router) {
    router.get('/twitter/latest-tweets.xml', latestTweets);
}