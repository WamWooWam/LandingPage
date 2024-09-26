import CoreWindow from "../Data/CoreWindow";

interface CoreWindowRestoreEventInit {
    window: CoreWindow;
    rect?: DOMRect;
}

export default class CoreWindowRestoreEvent extends CustomEvent<CoreWindowRestoreEventInit> {
    constructor(type: string, info: CoreWindowRestoreEventInit) {
        super(type, { detail: info });
    }
}