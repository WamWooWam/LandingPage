import { DOMParser, XMLSerializer } from 'xmldom'
import { EXT_XMLNS, createBindingFromTemplate, createRoot, createVisual } from "./utils";

import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";

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

        for (const note of notes) {
            if (note.visibility !== 'public') continue;

            let visual = createVisual(root);
            if (note.files && note.files.length > 0) {
                let content = createBindingFromTemplate(root, visual, TileTemplateType.tileWidePeekImage05);
                content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                content.getElementsByTagName("image")[0].setAttribute("alt", note.files[0].comment ?? note.files[0].name);
                content.getElementsByTagName("image")[1].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("image")[1].setAttribute("alt", note.user.name + " profile picture");
                content.getElementsByTagName("text")[1].textContent = note.text;
            }
            else {
                let content = createBindingFromTemplate(root, visual, TileTemplateType.tileWideSmallImageAndText03);
                content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
                content.getElementsByTagName("image")[0].setAttribute("alt", note.user.name + " profile picture");
                content.getElementsByTagName("text")[0].textContent = note.text;
            }

            {
                let content = null;
                if (note.files && note.files.length > 0) {
                    if (note.files.length === 1) {
                        content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310ImageAndText01);
                        content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                        content.getElementsByTagName("image")[0].setAttribute("alt", note.files[0].comment ?? note.files[0].name);
                        content.getElementsByTagName("text")[0].textContent = note.text;
                    }
                    else {
                        content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310ImageCollectionAndText01);
                        content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);
                        content.getElementsByTagName("image")[0].setAttribute("alt", note.files[0].comment ?? note.files[0].name);
                        content.getElementsByTagName("text")[0].textContent = note.text

                        const availableImages = [1, 2, 3, 4];
                        for (let i = 1; i < Math.min(note.files.length, 5) && availableImages.length; i++) {
                            const file = note.files[i];

                            let imageIndex = availableImages[Math.floor(Math.random() * availableImages.length)];
                            const image = content.getElementsByTagName("image")[imageIndex];
                            image.setAttribute("src", file.thumbnailUrl);
                            image.setAttribute("alt", file.comment ?? file.name);
                            
                            availableImages.splice(availableImages.indexOf(imageIndex), 1);
                        }
                    }
                }
                else {
                    content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310SmallImageAndText01);
                    content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
                    content.getElementsByTagName("image")[0].setAttribute("alt", note.user.name + " profile picture");
                    content.getElementsByTagName("text")[0].textContent = note.user.name;
                    content.getElementsByTagName("text")[1].textContent = note.text;
                }

            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }
}