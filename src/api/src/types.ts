export interface Message<T = any> {
    subsystem: number;
    type: number;
    channel?: number;
    replyChannel?: number;
    data: T;
}

/**
 * @internal
 */
export type RawMessage<T> = Omit<Message<T>, "subsystem">;

/**
 * @internal
 */
export interface Subsystem {
    id: number;
    sendMessage<S = any, R = any>(msg: RawMessage<S>): Promise<Message<R>>;
    postMessage<S = any>(msg: RawMessage<S>): Promise<void>;
    registerCallback(callback: (msg: Message) => any | Promise<any>, persist?: boolean): number;
    getCallback(id: number): ((msg: Message) => void) | undefined;
}

export interface IDeferrableEvent extends Event {
    getDeferral(): Deferral;
}

export interface Deferral {
    complete(): void;
}