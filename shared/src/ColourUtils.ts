export function getRGBFromString(str: string) {
    if (str[0] == '#') {
        str = str.slice(1);
    }

    var num = parseInt(str, 16);
    return [num >> 16, (num >> 8) & 0x00ff, num & 0x0000ff];
}

export function lightenDarkenColour(col: string, amt: number) {
    var usePound = false;

    if (col[0] == '#') {
        col = col.slice(1);
        usePound = true;
    }

    var num = parseInt(col, 16);

    var r = (num >> 16) + amt;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00ff) + amt;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000ff) + amt;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (
        (usePound ? '#' : '') +
        (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0')
    );
}

// lighten or darken a colour by a percentage using HSL
export function lightenDarkenColour2(col: string, amount: number) {
    if (col[0] == '#') {
        col = col.slice(1);
    }

    let hsl = rgbToHsl(getRGBFromString(col));
    hsl[2] = Math.max(0, Math.min(1, hsl[2] + amount));
    let rgb = hslToRgb(hsl);

    return (
        '#' +
        (rgb[2] | (rgb[1] << 8) | (rgb[0] << 16)).toString(16).padStart(6, '0')
    );
}

export function rgbToHsl(rgb: number[]): number[] {
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [h, s, l];
}

export function hslToRgb(hsl: number[]): number[] {
    let h = hsl[0];
    let s = hsl[1];
    let l = hsl[2];

    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        let hue2rgb = function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            else if (t > 1) t -= 1;

            if (t < 1 / 6) return p + (q - p) * 6 * t;
            else if (t < 1 / 2) return q;
            else if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
