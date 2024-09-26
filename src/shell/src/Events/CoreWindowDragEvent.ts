import CoreWindow from "../Data/CoreWindow";

interface CoreWindowDragEventInit {
    window: CoreWindow;
    pointer: PointerEvent;
    pointerPosition: { x: number, y: number };
}

export default class CoreWindowDragEvent extends CustomEvent<CoreWindowDragEventInit> {
    constructor(type: string, info: CoreWindowDragEventInit) {
        super(type, { detail: info });
    }
}