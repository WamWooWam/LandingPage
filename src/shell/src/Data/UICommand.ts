type UICommandInvokedHandler = (command: UICommand) => void;

export default class UICommand {
    id: any = null;
    label: string | null = null;
    invoked: UICommandInvokedHandler | null = null;
    constructor(label: string | null = null, action: UICommandInvokedHandler | null = null, commandId: any = null) {
        this.label = label;
        this.invoked = action;
        this.id = commandId;
    }
}
