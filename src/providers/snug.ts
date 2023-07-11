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

        let root = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
        let rootElement = root.getElementsByTagName("tile")[0];
        rootElement.removeChild(rootElement.getElementsByTagName("visual")[0]);

        for (const note of notes) {
            if (note.files && note.files.length > 0) {
                let content = TileUpdateManager.getTemplateContent(TileTemplateType.tileWidePeekImage05);
                content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                content.getElementsByTagName("image")[1].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("text")[1].textContent = note.text;

                rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
            }
            else {
                let content = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
                content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("text")[0].textContent = note.text;

                rootElement.appendChild(root.importNode(content.getElementsByTagName("visual")[0], true));
            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }
}