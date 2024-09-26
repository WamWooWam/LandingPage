import MessageDialog from "../Data/MessageDialog";
import UICommand from "../Data/UICommand";

interface MessageDialogEventInit {
    type: "open" | "close"
    dialog: MessageDialog
    command?: UICommand
}

export default class MessageDialogEvent extends CustomEvent<MessageDialogEventInit> {
    constructor(detail: MessageDialogEventInit) {
        super("message-dialog-" + detail.type, { detail });
    }
}