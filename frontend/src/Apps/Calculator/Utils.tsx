export function ConvertMarginToStyle(margin: string) {
    if (!margin) return null;

    const parts = margin.split(",");
    if (parts.length === 4) {
        const marginLeft = parts[0];
        const marginTop = parts[1];
        const marginRight = parts[2];
        const marginBottom = parts[3];

        return `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`;
    }

    if (parts.length === 2) {
        const marginLeft = parts[0];
        const marginTop = parts[1];

        return `${marginTop}px ${marginLeft}px`;
    }

    if (parts.length === 1) {
        const marginLeft = parts[0];

        return `${marginLeft}px`;
    }

    return null;
}
