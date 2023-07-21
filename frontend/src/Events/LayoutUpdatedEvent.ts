export default class LayoutUpdatedEvent extends CustomEvent<{ appendToHistory: boolean; }> {
    constructor(appendToHistory: boolean = true) {
        super("layout-updated", { detail: { appendToHistory: appendToHistory } });
    }
}
