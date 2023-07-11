
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
    return c * easeOutCirc(t) + b;
}

export function newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export async function hasWebP(): Promise<boolean> {
    // some small (2x1 px) test images for each feature
    var images = {
        lossless: "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA="
    };

    return new Promise((resolve, reject) => {
        var img = new Image();
        img.onload = () => {
            var result = (img.width > 0) && (img.height > 0);
            resolve(result);
        };
        img.onerror = () => {
            resolve(false);
        };
        img.src = images.lossless;
    });
};

export const fixupUrl = (url: string, hasWebP: boolean) => {
    if (hasWebP)
        return url;
    return url.replace(".webp", ".png");
}