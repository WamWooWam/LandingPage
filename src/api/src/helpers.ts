/**
 * @internal
 */
export function isHosted(): boolean {
    // a hosted app is one running in an iframe

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