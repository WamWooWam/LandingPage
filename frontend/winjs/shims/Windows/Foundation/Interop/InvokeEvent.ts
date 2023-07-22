export function InvokeEvent(events: Set<Function>, name: string, ...args: any) {
    var detail = args[0] ?? {};
    for (let i = 0; i < args.length; i++) {
        detail[i] = args[i];
    }

    var event = new CustomEvent(name, { detail: detail });
    Object.assign(event, detail);

    console.log(`event: Dispatching event ${name}`, event, detail);

    for (const handler of events) {
        try {
            handler(event);
        }
        catch (e) {
            // to try prevent complete app crashes from IPC
            console.error(e);
        }
    }
}

export function InvokeRawEvent(events: Set<Function>, name: string, args: any) {
    for (const handler of events) {
        try {
            handler(args);
        }
        catch (e) {
            // to try prevent complete app crashes from IPC
            console.error(e);
        }
    }
}