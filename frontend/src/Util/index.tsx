
export const EXT_XMLNS = "https://wamwoowam.co.uk/tiles/2022";

export interface Size {
    width: number;
    height: number;
}

export interface Position {
    x: number;
    y: number;
}

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


const testImages = {
    webp: "data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=",
    avif: "data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAOptZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAAA5waXRtAAAAAAABAAAAImlsb2MAAAAAREAAAQABAAAAAAEOAAEAAAAAAAAAIgAAACNpaW5mAAAAAAABAAAAFWluZmUCAAAAAAEAAGF2MDEAAAAAamlwcnAAAABLaXBjbwAAABNjb2xybmNseAABAA0AAIAAAAAMYXYxQ4EgAgAAAAAUaXNwZQAAAAAAAAAQAAAAEAAAABBwaXhpAAAAAAMICAgAAAAXaXBtYQAAAAAAAAABAAEEgYIDhAAAACptZGF0EgAKCDgM/9lAQ0AIMhQQAAAAFLm4wN/TRReKCcSo648oag=="
};

let webpSupported: boolean | null = null;
let avifSupported: boolean | null = null;

export async function hasWebP(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (webpSupported !== null) {
            resolve(webpSupported);
            return;
        }

        var img = new Image();
        img.onload = () => {
            resolve(webpSupported = ((img.width > 0) && (img.height > 0)));
        };
        img.onerror = () => {
            resolve(webpSupported = false);
        };
        img.src = testImages.webp;
    });
};

export async function hasAvif(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if(/**navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome") */ true) {
            resolve(avifSupported = false); // Safari's avif support is broken :D
            return;
        }

        if (avifSupported !== null) {
            resolve(avifSupported);
            return;
        }

        var img = new Image();
        img.onload = () => {
            resolve(avifSupported = ((img.width > 0) && (img.height > 0)));
        };
        img.onerror = () => {
            resolve(avifSupported = false);
        };
        img.src = testImages.avif;
    });
};

export async function pickImage(types: { avif?: string, webp?: string, png: string }): Promise<string> {
    if (types.avif && (avifSupported == true || await hasAvif())) {
        return types.avif;
    }

    if (types.webp && (webpSupported == true || await hasWebP())) {
        return types.webp;
    }

    return types.png;
}

export function isMobile(): boolean {
    return window.matchMedia("(max-width: 600px)").matches ? true : false;
}
