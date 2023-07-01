import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";
import { DOMParser, XMLSerializer } from 'xmldom'

export namespace YouTube {
    const rootUrl = 'https://www.googleapis.com/youtube/v3'
    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.YOUTUBE_API_KEY;

    export const recentVideos = async (req, res) => {
        const url = `${rootUrl}/search?part=snippet&channelId=${channelId}&maxResults=10&order=date&type=video&key=${apiKey}`
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })

        const json = await resp.json()
        const items = json.items;

        let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
        let root = new DOMParser().parseFromString(tile, 'application/xml');
        let rootElement = root.getElementsByTagName("tile")[0];
        rootElement.removeChild(rootElement.getElementsByTagName("visual")[0]);

        for (const video of items) {
            let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquarePeekImageAndText04);
            let content = new DOMParser().parseFromString(tile, 'application/xml');
            content.getElementsByTagName("image")[0].setAttribute("src", video.snippet.thumbnails.medium.url);
            content.getElementsByTagName("text")[0].textContent = video.snippet.title;

            rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));

    };
}