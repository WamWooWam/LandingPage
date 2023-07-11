import { XMLSerializer } from "xmldom";
import { TileTemplateType } from "../../TileTemplateType";
import { TileUpdateManager } from "../../TileUpdateManager";
import { TimelineType, getGraphUserByUsername, getGraphUserTweets } from "./api";
import { createBindingFromTemplate, createRoot, createVisual, } from "../utils";

let userCache = null;

export namespace Twitter {
    export const latestTweets = async (req, res) => {
        if (!userCache) {
            userCache = await getGraphUserByUsername("da_wamwoowam"); // TODO: env
        }

        let root = createRoot();
        let rootElement = root.documentElement;

        let timeline = await getGraphUserTweets(userCache["id_str"], TimelineType.Tweets, 10);
        let tweets = timeline["data"]["user_result"]["result"]["timeline_response"]["timeline"]["instructions"][2]["entries"];

        for (const tweetContainer of tweets) {
            if (!tweetContainer?.content?.content?.tweetResult?.result?.legacy) continue;
            let tweet = tweetContainer["content"]["content"]["tweetResult"]["result"]["legacy"];

            let visual = createVisual(root);
            if (tweet?.extended_entities?.media?.length > 0) {
                {
                    let content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquarePeekImageAndText04);
                    content.getElementsByTagName("image")[0].setAttribute("src", tweet["extended_entities"]["media"][0]["media_url_https"]);
                    content.getElementsByTagName("text")[0].textContent = tweet["full_text"];
                }

                {
                    let content = createBindingFromTemplate(root, visual, TileTemplateType.tileWidePeekImage05);
                    content.getElementsByTagName("image")[0].setAttribute("src", tweet["extended_entities"]["media"][0]["media_url_https"]);
                    content.getElementsByTagName("image")[1].setAttribute("src", userCache["profile_image_url_https"]);
                    content.getElementsByTagName("text")[1].textContent = tweet["full_text"];
                }
            }
            else {
                {
                    let tile = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare150x150Text04);
                    tile.getElementsByTagName("text")[0].textContent = tweet["full_text"];
                }
                {
                    let tile = createBindingFromTemplate(root, visual, TileTemplateType.tileWideSmallImageAndText03);
                    tile.getElementsByTagName("text")[0].textContent = tweet["full_text"];
                    tile.getElementsByTagName("image")[0].setAttribute("src", userCache["profile_image_url_https"]);
                }
            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    };
}