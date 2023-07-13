/*
    This file is based on Nitter, and is therefore licenced under AGPLv3, NOT MIT.
    See LICENCE in the current folder for more information.
*/

import { AUTH_HEADER, USER_AGENT } from "./consts.js";

const LAST_USE_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hour
const MAX_AGE = 175 * 60 * 1000; // 175 minutes

let fetchedAt = 0;
let lastUse = 0;
let token = null;

async function fetchToken(): Promise<string> {
    let response = await fetch("https://api.twitter.com/1.1/guest/activate.json", {
        headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Host': 'api.twitter.com',
            'Origin': 'https://twitter.com',
            'Referer': 'https://twitter.com/',
            'User-Agent': USER_AGENT
        },
        method: "POST",
    });

    let data = await response.json();
    return data["guest_token"];
}

export async function ensureToken(): Promise<string> {
    if (Date.now() - lastUse > LAST_USE_TIMEOUT || Date.now() - fetchedAt > MAX_AGE || !token) {
        token = await fetchToken();
        fetchedAt = Date.now();
    }

    lastUse = Date.now();

    return token;
}

export async function fetchRaw(url: string, params: any) {
    let token = await ensureToken();
    let headers = {
        'Authorization': AUTH_HEADER,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Host': 'api.twitter.com',
        'Origin': 'https://twitter.com',
        'Referer': 'https://twitter.com/',
        'User-Agent': USER_AGENT,
        'X-Guest-Token': token,
        'X-Twitter-Active-User': 'yes',
        'DNT': '1',
    };

    let uri = new URL(url);
    for (let key in params) {
        uri.searchParams.append(key, params[key]);
    }
    
    let response = await fetch(uri.toString(), { headers: headers });

    if(response.status != 200) {
        throw `Twitter fetch failed: ${response.status} ${response.statusText}`;
    }

    return await response.json();
}

