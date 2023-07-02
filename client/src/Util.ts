
export function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3);
}

export function easeOutCirc(x: number): number {
    return Math.sqrt(1 - Math.pow(x - 1, 2));
}

export function easeInCirc(x: number): number {
    return 1 - Math.sqrt(1 - Math.pow(x, 2));
}

export function easeInCubic(x: number): number {
    return x * x * x;
}

export function cubicEase(t: number, b: number, c: number, d: number) {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
}

export function circularEase(t: number, b: number, c: number, d: number) {
    // t /= d;
    // t--;
    // return c * Math.sqrt(1 - t * t) + b;

    return c * easeOutCirc(t) + b;
}

export function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
