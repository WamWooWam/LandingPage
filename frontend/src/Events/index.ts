// singleton class used to route events between components
export default class Events {
    private static instance: Events;
    private eventTarget: EventTarget;

    private constructor() {
        this.eventTarget = document.createElement('div');
    }

    public static getInstance(): Events {
        if (!Events.instance) {
            Events.instance = new Events();
        }

        return Events.instance;
    }

    public addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void {
        this.eventTarget.addEventListener(type, listener, options);
    }

    public removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void {
        this.eventTarget.removeEventListener(type, listener, options);
    }

    public dispatchEvent(event: Event): boolean {
        console.warn('dispatching event: %s, %O', event.type, event);
        return this.eventTarget.dispatchEvent(event);
    }
}
