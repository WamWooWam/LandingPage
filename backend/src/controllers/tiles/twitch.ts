import { DOMParser, XMLSerializer } from 'xmldom'
import { EXT_XMLNS, createBindingFromTemplate, createRoot } from "../../utils";
import { Request, Response, Router } from 'express';

import { TileTemplateType } from "../../TileTemplateType";
import { TileUpdateManager } from "../../TileUpdateManager";

const rootUrl = 'https://api.twitch.tv/helix'
const twitchUsername = process.env.TWITCH_USERNAME;
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

let access_token = null;
let token_expires = null;

let avatar_url = null;

const getAccessToken = async () => {
    const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`
    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })

    if (!resp.ok)
        throw await resp.json();

    const json = await resp.json()
    access_token = json.access_token;
    token_expires = Date.now() + (json.expires_in * 1000);
}

const ensureAccessToken = async () => {
    if (access_token == null || token_expires == null || token_expires < Date.now()) {
        await getAccessToken();
    }

    return access_token;
}

const getUser = async (username: string) => {
    const url = `${rootUrl}/users?login=${username}`
    const resp = await fetch(url, {
        method: 'GET',
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${await ensureAccessToken()}`
        }
    })

    const json = await resp.json()
    return json.data[0];
}

const isLive = async (req: Request, res: Response) => {
    const user = await getUser(twitchUsername);
    let url = `${rootUrl}/streams?user_id=${user.id}`
    let resp = await fetch(url, {
        method: 'GET',
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${await ensureAccessToken()}`
        }
    })

    let json = await resp.json()
    if (json.data?.length > 0) {
        let stream = json.data[0];
        let content = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquarePeekImageAndText04);
        content.getElementsByTagName("image")[0].setAttribute("src", stream.thumbnail_url.replace('{width}', '267').replace('{height}', '150'));
        content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", "Thumbnail for " + stream.title);

        content.getElementsByTagName("text")[0].textContent = "🔴 LIVE: " + stream.title;

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(content));
        return;
    }

    // if we're not live, try get recent VODs
    url = `${rootUrl}/videos?user_id=${user.id}&first=5`
    resp = await fetch(url, {
        method: 'GET',
        headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${await ensureAccessToken()}`
        }
    })

    json = await resp.json()
    if (json.data?.length > 0) {
        let root = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
        let rootElement = root.getElementsByTagName("tile")[0];
        rootElement.removeChild(rootElement.getElementsByTagName("visual")[0]);

        for (const video of json.data) {
            let content = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquarePeekImageAndText04);
            content.getElementsByTagName("image")[0].setAttribute("src", video.thumbnail_url.replace('%{width}', '267').replace('%{height}', '150'));
            content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", "Thumbnail for " + video.title);
            content.getElementsByTagName("text")[0].textContent = "📺 " + video.title;

            rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
        return;
    }
    else {
        res.status(204).send();
    }
};

export default function registerRoutes(router: Router) {
    router.get('/twitch/is-live.xml', isLive);
}