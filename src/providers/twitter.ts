import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";
import { DOMParser, XMLSerializer } from 'xmldom'

export namespace Twitter {
    export const latestTweets = async (req, res) => {
        let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquarePeekImageAndText04);
        let content = new DOMParser().parseFromString(tile, 'application/xml');
        content.getElementsByTagName("image")[0].setAttribute("src", "https://pbs.twimg.com/profile_images/1598394571217666097/8bush5d7_400x400.jpg");
        content.getElementsByTagName("text")[0].textContent = "This used to show Tweets, then Elongated Muskrat decided my own tweets cost $100/month lmao";

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(content));
    };
}