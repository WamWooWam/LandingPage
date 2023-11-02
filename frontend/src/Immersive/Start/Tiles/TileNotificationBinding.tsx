import { useContext, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { CSSProperties } from "preact/compat";
import PackageImage from "~/Util/PackageImage";
import { RenderableProps } from "preact";
import { TileContext } from "./TileRenderer";
import { getTileSize } from "./TileUtils";

type Rectangle = {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

type TileNotificationBindingProps = {
    className: string;

    width: number;
    height: number;
    x: number;
    y: number;

    secondaryImageId?: number;

    dynamicFormat?: boolean;
    forceBadgePlate?: boolean;

    singleLineYOffset?: string;
    peekMargin?: string;

    imageBounds?: Rectangle;
    logoMargins?: Rectangle;
    badgeMargins?: Rectangle;
    logoAndBadgeMargins?: Rectangle;
}

export default function TileNotificationBinding(props: RenderableProps<TileNotificationBindingProps>) {
    const ref = useRef<HTMLDivElement>(null);
    const tile = useContext(TileContext);

    const [interval, setInterval] = useState<number>(null);
    const [subVisual, setSubVisual] = useState<number>(0);

    const tileSize = getTileSize(tile.size);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const subVisuals = Math.ceil(props.height / tileSize.height);
        const interval = window.setInterval(() => {
            setSubVisual((subVisual) => (subVisual + 1) % subVisuals);
        }, 5000);

        setInterval(interval);

        return () => window.clearInterval(interval);
    }, [ref.current]);

    const style: CSSProperties = {
        width: tileSize.width,
        height: tileSize.height,
        transform: `translateY(${(-tileSize.height) * subVisual}px)`,
    }

    return (
        <div ref={ref} className={`${props.className} tile-notification logo`} style={style}>
            {props.children}
        </div>
    )
}