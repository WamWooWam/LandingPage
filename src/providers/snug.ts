import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";
import { DOMParser, XMLSerializer } from 'xmldom'

export namespace Snug {
    const rootUrl = 'https://snug.moe/api'
    const userId = process.env.SNUG_USER_ID;

    const usersNotes = async (username: string) => {
        const url = `${rootUrl}/users/notes`
        const body = {
            userId: username,
            includeReplies: false,
            limit: 10,
            includeMyRenotes: false,
            excludeNsfw: true
        }

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-App-Token': 'public'
            },
            body: JSON.stringify(body)
        })

        const json = await res.json()
        return json
    }

    export const latestNotes = async (req, res) => {
        let notes = await usersNotes(userId)

        let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
        let root = new DOMParser().parseFromString(tile, 'application/xml');
        let rootElement = root.getElementsByTagName("tile")[0];
        rootElement.removeChild(rootElement.getElementsByTagName("visual")[0]);

        for (const note of notes) {
            if (note.files && note.files.length > 0) {
                let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileWidePeekImage05);
                let content = new DOMParser().parseFromString(tile, 'application/xml');
                content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                content.getElementsByTagName("image")[1].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("text")[1].textContent = note.text;

                rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
            }
            else {
                let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
                let content = new DOMParser().parseFromString(tile, 'application/xml');
                content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("text")[0].textContent = note.text;

                rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }
}