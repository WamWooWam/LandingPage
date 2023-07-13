import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";
import { DOMParser, XMLSerializer } from 'xmldom'
import { EXT_XMLNS, createBindingFromTemplate, createRoot, createVisual } from "./utils";

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

        let root = createRoot();
        let rootElement = root.documentElement;

        for (const note of notes) {
            if (note.visibility !== 'public') continue;

            let visual = createVisual(root);
            if (note.files && note.files.length > 0) {
                let content = createBindingFromTemplate(root, visual, TileTemplateType.tileWidePeekImage05);
                content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", note.files[0].comment ?? note.files[0].name);
                content.getElementsByTagName("image")[1].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("image")[1].setAttributeNS(EXT_XMLNS, "ext:alt", note.user.name + " profile picture");
                content.getElementsByTagName("text")[1].textContent = note.text;
            }
            else {
                let content = createBindingFromTemplate(root, visual, TileTemplateType.tileWideSmallImageAndText03);
                content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", note.user.name + " profile picture");
                content.getElementsByTagName("text")[0].textContent = note.text;
            }

            {
                let content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310ImageAndTextOverlay02);
                if (note.files && note.files.length > 0) {
                    content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                    content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", note.files[0].comment ?? note.files[0].name);
                }
                else {
                    content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
                    content.getElementsByTagName("image")[0].setAttributeNS(EXT_XMLNS, "ext:alt", note.user.name + " profile picture");
                }

                content.getElementsByTagName("text")[0].textContent = note.user.name;
                content.getElementsByTagName("text")[1].textContent = note.text;
            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }
}