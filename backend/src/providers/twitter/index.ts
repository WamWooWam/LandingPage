import { XMLSerializer } from "xmldom";
import { TileTemplateType } from "../../TileTemplateType.js";
import { TileUpdateManager } from "../../TileUpdateManager.js";
import { TimelineType, getGraphUserByUsername, getGraphUserTweets } from "./api.js";
import { EXT_XMLNS, createBindingFromTemplate, createRoot, createVisual, } from "../utils.js";

let userCache = null;

export namespace Twitter {
    // remove the file extension, add the query ?format=webp&name=thumb, except for ext_tw_video_thumb, then we append :thumb
    const fixupTwitterImage = (url: string) => {
        if (!url) return null;
        if (url.match(/\/ext_tw_video_thumb\//)) {
            return url + ":thumb";
        }
        return url.replace(/\.[^/.]+$/, "") + "?format=webp&name=thumb";
    }

    export const latestTweets = async (req, res) => {
        try {
            if (!userCache) {
                userCache = await getGraphUserByUsername(process.env.TWITTER_USERNAME);
            }

            let root = createRoot();
            let timeline = await getGraphUserTweets(userCache["id_str"], TimelineType.Tweets, 15);
            let tweets = timeline["data"]["user_result"]["result"]["timeline_response"]["timeline"]["instructions"][2]["entries"];
            if (tweets.length > 15)
                tweets = tweets.slice(0, 15);

            for (const tweetContainer of tweets) {
                if (!tweetContainer?.content?.content?.tweetResult?.result?.legacy) continue;
                let tweet = tweetContainer["content"]["content"]["tweetResult"]["result"]["legacy"];

                let visual = createVisual(root);
                if (tweet?.extended_entities?.media?.length > 0) {
                    {
                        let content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquarePeekImageAndText04);
                        content.getElementsByTagName("image")[0].setAttribute("src", fixupTwitterImage(tweet["extended_entities"]["media"][0]["media_url_https"]));
                        content.getElementsByTagName("text")[0].textContent = tweet["full_text"];
                    }

                    {
                        let content = createBindingFromTemplate(root, visual, TileTemplateType.tileWidePeekImage05);
                        content.getElementsByTagName("image")[0].setAttribute("src", fixupTwitterImage(tweet["extended_entities"]["media"][0]["media_url_https"]));
                        content.getElementsByTagName("image")[1].setAttribute("src", userCache["profile_image_url_https"]);
                        content.getElementsByTagName("image")[1].setAttributeNS(EXT_XMLNS, "ext:alt", userCache["name"] + " profile picture");
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
                        tile.getElementsByTagName("image")[0].setAttribute("alt", userCache["name"] + " profile picture");
                    }
                }
            }

            res.contentType('application/xml')
                .send(new XMLSerializer().serializeToString(root));
        }
        catch (e) {            
            res.status(204).send();            
        }

    };
}