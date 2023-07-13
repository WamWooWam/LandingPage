/*
    This file is based on Nitter, and is therefore licenced under AGPLv3, NOT MIT.
    See LICENCE in the current folder for more information.
*/

import { GRAPHQL, GRAPHQL_FEATURES } from "./consts.js";
import { fetchRaw } from "./fetch.js";

export enum TimelineType {
    Tweets, Replies, Media
}

export async function getGraphUserById(id: string) {
    let variables = {
        "rest_id": id,
    }

    let params = { "variables": JSON.stringify(variables), "features": JSON.stringify(GRAPHQL_FEATURES) };
    let response = await fetchRaw(GRAPHQL.UserResultById, params);

    return response;
}

export async function getGraphUserByUsername(username: string) {
    let variables = {
        "screen_name": username,
    }

    let params = { "variables": JSON.stringify(variables), "features": JSON.stringify(GRAPHQL_FEATURES) };
    let response = await fetchRaw(GRAPHQL.UserResultByScreenName, params);

    return response["data"]["user_result"]["result"]["legacy"];
}

export async function getGraphUserTweets(id: string, timeline: TimelineType, count: number = 20, after: string = null) {
    let variables = {
        "rest_id": id,
        "count": count
    }

    if (after) {
        variables["cursor"] = after;
    }

    let params = { "variables": JSON.stringify(variables), "features": JSON.stringify(GRAPHQL_FEATURES) };
    let uri = "";
    switch (timeline) {
        case TimelineType.Tweets:
            uri = GRAPHQL.UserProfileWithTweetsV2;
            break;
        default:
        case TimelineType.Replies:
        case TimelineType.Media:
            throw "Not implemented";
    };

    let response = await fetchRaw(uri, params);

    return response;
}