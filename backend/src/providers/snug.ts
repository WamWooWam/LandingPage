import { DOMParser, XMLSerializer } from 'xmldom'
import { EXT_XMLNS, createBindingFromTemplate, createRoot, createVisual } from "./utils";

import { APIClient } from 'misskey-js/built/api';
import { Note } from 'misskey-js/built/entities';
import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";

export namespace Snug {
    const rootUrl = 'https://snug.moe'
    const userId = process.env.SNUG_USER_ID;
    const client = new APIClient({ origin: rootUrl });

    export const latestNotes = async (req, res) => {
        let notes = await usersNotes()
        let root = createRoot();

        for (let note of notes) {
            if (note.visibility !== 'public') continue;

            if (note.renote && !note.text) {
                note = note.renote!;
            }

            const visual = createVisual(root);
            const displayName = getName(note);

            visual.setAttribute("contentId", note.id);

            addWide310x150Visual(note, root, visual);
            addSquare310x310Visual(note, root, visual, displayName);
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    }

    async function usersNotes(): Promise<Note[]> {
        return await client.request('users/notes', {
            userId,
            includeReplies: false,
            limit: 25,
            includeMyRenotes: false,
            excludeNsfw: true
        });
    }

    function getName(note: Note): string {
        if (note.user.host) {
            return `@${note.user.username}@${note.user.host}`;
        }

        return note.user.name;
    }

    function getReactionsString(note: Note): string {
        let segments: string[] = [];
        if (note.renoteCount) segments.push(`🔁 ${note.renoteCount}`);
        if (note.repliesCount) segments.push(`↩️ ${note.repliesCount}`);

        for (const reaction of Object.entries(note.reactions)) {
            if (reaction[0].startsWith(':')) continue; // skip custom reactions
            segments.push(`${reaction[0]} ${reaction[1]}`);
        }

        return segments.join(' - ');
    }

    function addWide310x150Visual(note: Note, root: Document, visual: Element) {
        if (note.files && note.files.length > 0) {
            const content = createBindingFromTemplate(root, visual, TileTemplateType.tileWide310x150PeekImage07);
            content.getElementsByTagName("image")[0].setAttribute("src", note.files[0].thumbnailUrl);

            if (note.files[0].comment)
                content.getElementsByTagName("image")[0].setAttribute("alt", note.files[0].comment);

            content.getElementsByTagName("image")[1].setAttribute("src", note.user.avatarUrl);
            content.getElementsByTagName("image")[1].setAttribute("alt", `${note.user.name} profile picture`);
            content.getElementsByTagName("text")[0].textContent = note.text;
        }
        else {
            const content = createBindingFromTemplate(root, visual, TileTemplateType.tileWide310x150SmallImageAndText03);
            content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
            content.getElementsByTagName("image")[0].setAttribute("alt", `${note.user.name} profile picture`);
            content.getElementsByTagName("text")[0].textContent = note.text;
        }
    }

    function addSquare310x310Visual(note: Note, root: Document, visual: Element, displayName: string) {
        let files = note.files?.filter(f => f.thumbnailUrl) // only use files with thumbnails so we have something to show

        // if we dont have any files, use the small image and text template
        if (!files || files.length === 0) {
            const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310SmallImageAndText01);
            content.getElementsByTagName("image")[0].setAttribute("src", note.user.avatarUrl);
            content.getElementsByTagName("image")[0].setAttribute("alt", note.user.name + " profile picture");

            content.getElementsByTagName("text")[0].textContent = displayName;
            content.getElementsByTagName("text")[1].textContent = note.text;
            content.getElementsByTagName("text")[2].textContent = getReactionsString(note);

            return;
        }

        // for one file, use the image and text template, otherwise use the image collection template for up to 5 files
        const file = files[0];
        if (files.length === 1) {
            const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310ImageAndText01);
            content.getElementsByTagName("image")[0].setAttribute("src", file.thumbnailUrl);
            if (file.comment)
                content.getElementsByTagName("image")[0].setAttribute("alt", file.comment);
            content.getElementsByTagName("text")[0].textContent = note.text ?? "";
            return;
        }

        // otherwise, use the image collection template for up to 5 files and randomize the images
        const content = createBindingFromTemplate(root, visual, TileTemplateType.tileSquare310x310ImageCollectionAndText01);
        content.getElementsByTagName("image")[0].setAttribute("src", file.thumbnailUrl);
        if (file.comment)
            content.getElementsByTagName("image")[0].setAttribute("alt", file.comment);
        content.getElementsByTagName("text")[0].textContent = note.text ?? "";

        const availableImages = [1, 2, 3, 4];
        for (let i = 1; i < Math.min(files.length, 5) && availableImages.length; i++) {
            const file = files[i];

            let imageIndex = availableImages[Math.floor(Math.random() * availableImages.length)];
            const image = content.getElementsByTagName("image")[imageIndex];
            image.setAttribute("src", file.thumbnailUrl);
            image.setAttribute("alt", file.comment ?? file.name);

            availableImages.splice(availableImages.indexOf(imageIndex), 1);
        }

        for (const available of availableImages) {
            const file = files[Math.floor(Math.random() * files.length)];
            const image = content.getElementsByTagName("image")[available];
            image.setAttribute("src", file.thumbnailUrl);
            image.setAttribute("alt", file.comment ?? file.name);
        }
    }
}