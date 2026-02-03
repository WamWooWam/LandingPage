if (typeof globalThis === "undefined") {
    (window["globalThis"] as any) = window;
}

if (typeof CustomEvent === "undefined") {
    abstract class CustomEvent<T> extends Event {
        #detail: T;

        constructor(type: string, options: { detail: T }) {
            super(type, options as EventInit);
            this.#detail = options?.detail ?? null;
        }

        get detail() {
            return this.#detail;
        }
    }

    (globalThis["CustomEvent"] as any) = CustomEvent;
}

if (typeof Array.prototype.flatMap !== "function") {
    Array.prototype.flatMap = function <T, U>(this: T[], callback: (value: T, index: number, array: T[]) => U[]): U[] {
        return Array.prototype.concat(...this.map(callback));
    }
}

if (typeof queueMicrotask !== 'function') {
    let promise: Promise<void>;
    globalThis['queueMicrotask'] = cb => (promise || (promise = Promise.resolve()))
        .then(cb)
        .catch((err: Error) => setTimeout(() => { throw err }, 0));
}


if(typeof structuredClone !== 'function') {
    // incorrect, but good enough for how I use structuredClone
    // will this bite me in the ass? probably
    globalThis['structuredClone'] = (e) => JSON.parse(JSON.stringify(e)); 
}