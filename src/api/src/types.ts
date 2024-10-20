export interface Message<T = any> {
    type: string,
    channel?: number;
    replyChannel?: number;
    data: T;
    errored?: boolean;
}

/**
 * @internal
 */
export type RawMessage<T> = Omit<Omit<Message<T>, "errored">, "subsystem">;

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


export interface Deferral {
    complete(): void;
}

export interface ActivatedOperation {
    getDeferral(): Deferral;
}

export type LaunchActivatedEvent = CustomEvent<LaunchActivatedEventArgs>

export interface LaunchActivatedEventArgs {
    kind: "launch";
    args: string[];
    activatedOperation: ActivatedOperation;
}