import { DOMParser, XMLSerializer } from 'xmldom';
import {
    EXT_XMLNS,
    createBindingFromTemplate,
    createRoot,
    createVisual,
} from '../../utils';
import { Request, Response, Router } from 'express';

import { APIClient } from 'misskey-js/built/api';
import { Note } from 'misskey-js/built/entities';
import { TileTemplateType } from '../../TileTemplateType';
import { TileUpdateManager } from '../../TileUpdateManager';

class MisskeyTileProvider {
    private client: APIClient;

    constructor(
        host: string,
        private userId: string,
    ) {
        this.client = new APIClient({ origin: host });
    }

    async lastestNotes(req: Request, res: Response) {
        let notes = await this.usersNotes();
        let root = createRoot();

        for (let note of notes) {
            if (note.visibility !== 'public') continue;

            if (note.renote && !note.text) {
                note = note.renote!;
            }

            const visual = createVisual(root);
            const displayName = this.getName(note);

            visual.setAttribute('contentId', note.id);

            this.addWide310x150Visual(note, root, visual);
            this.addSquare310x310Visual(note, root, visual, displayName);
        }

        res.contentType('application/xml').send(
            new XMLSerializer().serializeToString(root),
        );
    }

    private async usersNotes(): Promise<Note[]> {
        return await this.client.request('users/notes', {
            userId: this.userId,
            includeReplies: false,
            limit: 25,
            includeMyRenotes: false,
            excludeNsfw: true,
        });
    }

    private getName(note: Note): string {
        if (note.user.host) {
            return `@${note.user.username}@${note.user.host}`;
        }

        return note.user.name;
    }

    private getReactionsString(note: Note): string {
        let segments: string[] = [];
        if (note.renoteCount) segments.push(`🔁 ${note.renoteCount}`);
        if (note.repliesCount) segments.push(`↩️ ${note.repliesCount}`);

        for (const reaction of Object.entries(note.reactions)) {
            if (reaction[0].startsWith(':')) continue; // skip custom reactions
            segments.push(`${reaction[0]} ${reaction[1]}`);
        }

        return segments.join(' - ');
    }

    private addWide310x150Visual(note: Note, root: Document, visual: Element) {
        if (note.files && note.files.length > 0) {
            const content = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileWide310x150PeekImage07,
            );
            content
                .getElementsByTagName('image')[0]
                .setAttribute('src', note.files[0].thumbnailUrl);

            if (note.files[0].comment)
                content
                    .getElementsByTagName('image')[0]
                    .setAttribute('alt', note.files[0].comment);

            content
                .getElementsByTagName('image')[1]
                .setAttribute('src', note.user.avatarUrl);
            content
                .getElementsByTagName('image')[1]
                .setAttribute('alt', `${note.user.name} profile picture`);
            content.getElementsByTagName('text')[0].textContent = note.text;
        } else {
            const content = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileWide310x150SmallImageAndText03,
            );
            content
                .getElementsByTagName('image')[0]
                .setAttribute('src', note.user.avatarUrl);
            content
                .getElementsByTagName('image')[0]
                .setAttribute('alt', `${note.user.name} profile picture`);
            content.getElementsByTagName('text')[0].textContent = note.text;
        }
    }

    private addSquare310x310Visual(
        note: Note,
        root: Document,
        visual: Element,
        displayName: string,
    ) {
        let files = note.files?.filter((f) => f.thumbnailUrl); // only use files with thumbnails so we have something to show

        // if we dont have any files, use the small image and text template
        if (!files || files.length === 0) {
            const content = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileSquare310x310SmallImageAndText01,
            );
            content
                .getElementsByTagName('image')[0]
                .setAttribute('src', note.user.avatarUrl);
            content
                .getElementsByTagName('image')[0]
                .setAttribute('alt', note.user.name + ' profile picture');

            content.getElementsByTagName('text')[0].textContent = displayName;
            content.getElementsByTagName('text')[1].textContent = note.text;
            content.getElementsByTagName('text')[2].textContent =
                this.getReactionsString(note);

            return;
        }

        // for one file, use the image and text template, otherwise use the image collection template for up to 5 files
        const file = files[0];
        if (files.length === 1) {
            const content = createBindingFromTemplate(
                root,
                visual,
                TileTemplateType.tileSquare310x310ImageAndText01,
            );
            content
                .getElementsByTagName('image')[0]
                .setAttribute('src', file.thumbnailUrl);
            if (file.comment)
                content
                    .getElementsByTagName('image')[0]
                    .setAttribute('alt', file.comment);
            content.getElementsByTagName('text')[0].textContent =
                note.text ?? '';
            return;
        }

        // otherwise, use the image collection template for up to 5 files and randomize the images
        const content = createBindingFromTemplate(
            root,
            visual,
            TileTemplateType.tileSquare310x310ImageCollectionAndText01,
        );
        content
            .getElementsByTagName('image')[0]
            .setAttribute('src', file.thumbnailUrl);
        if (file.comment)
            content
                .getElementsByTagName('image')[0]
                .setAttribute('alt', file.comment);
        content.getElementsByTagName('text')[0].textContent = note.text ?? '';

        const availableImages = [1, 2, 3, 4];
        for (
            let i = 1;
            i < Math.min(files.length, 5) && availableImages.length;
            i++
        ) {
            const file = files[i];

            let imageIndex =
                availableImages[
                    Math.floor(Math.random() * availableImages.length)
                ];
            const image = content.getElementsByTagName('image')[imageIndex];
            image.setAttribute('src', file.thumbnailUrl);
            image.setAttribute('alt', file.comment ?? file.name);

            availableImages.splice(availableImages.indexOf(imageIndex), 1);
        }

        for (const available of availableImages) {
            const file = files[Math.floor(Math.random() * files.length)];
            const image = content.getElementsByTagName('image')[available];
            image.setAttribute('src', file.thumbnailUrl);
            image.setAttribute('alt', file.comment ?? file.name);
        }
    }
}

export default function registerRoutes(
    router: Router,
    name: string,
    origin: string,
    userId: string,
) {
    const provider = new MisskeyTileProvider(origin, userId);
    router.get(
        `/${name}/latest-notes.xml`,
        provider.lastestNotes.bind(provider),
    );
}
