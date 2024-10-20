/**
 * @internal
 */
export function isHosted(): boolean {
    // a hosted app is one running in an iframe

    if (typeof window === "undefined") {
        return false;
    }

    if (window.top == window.self) {
        return false;
    }

    // make sure that the parent is the same origin
    try {
        return window.top.location.host === window.self.location.host;
    } catch (e) {
        return false;
    }
}


/**
 * @internal
 */
export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}