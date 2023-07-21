import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";
import { DOMParser, XMLSerializer } from 'xmldom'
import { EXT_XMLNS, createRoot } from "./utils";

export namespace YouTube {
    const rootUrl = 'https://www.googleapis.com/youtube/v3'
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;

    export const recentVideos = async (req, res) => {
        // fetch most recent 10 videos without using the search endpoint
        // https://developers.google.com/youtube/v3/docs/playlistItems/list
        let url = `${rootUrl}/playlistItems?part=snippet&maxResults=10&playlistId=${channelId}&key=${apiKey}`;
        let resp = await fetch(url);
        let json = await resp.json();
        let items = json.items;

        let root = createRoot();
        let rootElement = root.documentElement;

        for (const video of items) {
            let content = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquarePeekImageAndText04);
            content.getElementsByTagName("image")[0].setAttribute("src", video.snippet.thumbnails.medium.url);
            content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", "Thumbnail for " + video.snippet.title);
            content.getElementsByTagName("text")[0].textContent = video.snippet.title;

            rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));

    };
}