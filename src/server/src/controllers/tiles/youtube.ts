import { Application, Request, Response, Router } from 'express';

import { TileTemplateType } from "../../TileTemplateType";
import { TileUpdateManager } from "../../TileUpdateManager";
import { XMLSerializer } from 'xmldom'
import { createRoot } from "../../utils";

const rootUrl = 'https://www.googleapis.com/youtube/v3'
const channelId = process.env.YOUTUBE_CHANNEL_ID;
const playlistId = process.env.YOUTUBE_PLAYLIST_ID;
const apiKey = process.env.YOUTUBE_API_KEY;

let channel = null;

const getChannel = async () => {
    let url = `${rootUrl}/channels?part=snippet&id=${channelId}&fields=items%2Fsnippet%2Fthumbnails&key=${apiKey}`;
    let resp = await fetch(url);
    let json = await resp.json();
    return json.items[0];
}

//    
// for some reason, they removed the ability to get the channel's uploads playlist directly
// so this pulls from a specific playlist instead
//
const recentVideos = async (req: Request, res: Response) => {
    if (!channel) {
        channel = await getChannel();
    }

    // https://developers.google.com/youtube/v3/docs/playlistItems/list
    let url = `${rootUrl}/playlistItems?part=snippet&maxResults=15&playlistId=${playlistId}&key=${apiKey}`;
    let resp = await fetch(url);
    let json = await resp.json();
    let items = json.items;

    let root = createRoot();
    let rootElement = root.documentElement;

    for (const video of items) {
        let content = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquarePeekImageAndText04);
        content.getElementsByTagName("image")[0].setAttribute("src", video.snippet.thumbnails.medium.url);
        content.getElementsByTagName("image")[0].setAttribute("alt", "Thumbnail for " + video.snippet.title);
        content.getElementsByTagName("text")[0].textContent = video.snippet.title;

        rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));

        let wideContent = TileUpdateManager.getTemplateContent(TileTemplateType.tileWide310x150PeekImage05);
        wideContent.getElementsByTagName("image")[0].setAttribute("src", video.snippet.thumbnails.medium.url);
        wideContent.getElementsByTagName("image")[0].setAttribute("alt", "Thumbnail for " + video.snippet.title);
        wideContent.getElementsByTagName("image")[1].setAttribute("src", channel.snippet.thumbnails.medium.url);
        wideContent.getElementsByTagName("image")[1].setAttribute("alt", "Thumbnail for " + channel.snippet.title);
        wideContent.getElementsByTagName("text")[0].textContent = video.snippet.videoOwnerChannelTitle;
        wideContent.getElementsByTagName("text")[1].textContent = video.snippet.title;

        rootElement.appendChild(root.importNode(wideContent.getElementsByTagName("visual")[0], true));
    }

    res.contentType('application/xml')
        .send(new XMLSerializer().serializeToString(root));

};

export default function registerRoutes(router: Router) {
    router.get('/youtube/recent-videos.xml', recentVideos);
}