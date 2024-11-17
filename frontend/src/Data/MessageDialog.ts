import Events from '../Events';
import MessageDialogEvent from '../Events/MessageDialogEvent';
import UICommand from './UICommand';
import { newGuid } from '../Util';

export default class MessageDialog {
    private id: string;

    title: string = null;
    content: string = null;
    defaultCommandIndex: number = null;
    cancelCommandIndex: number = null;
    commands: UICommand[] = null;

    constructor(content: string, title: string = '') {
        this.id = newGuid();
        this.content = content;
        this.title = title;
        this.commands = [];
    }

    showAsync(): Promise<UICommand> {
        if (this.commands.length == 0) {
            this.commands.push(new UICommand('Close'));
        }

        for (let i = 0; i < this.commands.length; i++) {
            const el = this.commands[i];
            if (!el.id) el.id = i;
        }

        return new Promise((resolve, reject) => {
            let events = Events.getInstance();
            events.addEventListener(
                'message-dialog-close',
                (e: MessageDialogEvent) => {
                    if (e.detail.dialog.id !== this.id) return;

                    if (e.detail.command) resolve(e.detail.command);
                    else reject();
                },
            );

            events.dispatchEvent(
                new MessageDialogEvent({ type: 'open', dialog: this }),
            );
        });
    }
}
