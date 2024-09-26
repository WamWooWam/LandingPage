import CoreWindow from "../Data/CoreWindow";

export default class CoreWindowEvent extends CustomEvent<CoreWindow> {
    constructor(type: string, info: CoreWindow) {
        super(type, { detail: info });
    }
}