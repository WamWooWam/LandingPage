type UICommandInvokedHandler = (command: UICommand) => void;

export default class UICommand {
    id: any = null;
    label: string = null;
    invoked: UICommandInvokedHandler = null;
    constructor(label: string = null, action: UICommandInvokedHandler = null, commandId: any = null) {
        this.label = label;
        this.invoked = action;
        this.id = commandId;
    }
}
