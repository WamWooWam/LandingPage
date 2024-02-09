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
    const scaleRef = useRef<HTMLDivElement>(null);
    const tile = useContext(TileContext);

    const [subVisual, setSubVisual] = useState<number>(0);
    const [scale, setScale] = useState<number>(1);

    useEffect(() => {
        const tileSize = getTileSize(tile.size);
        const subVisuals = Math.ceil(props.height / tileSize.height);
        if (subVisuals <= 1) return;

        const interval = window.setInterval(() => {
            setSubVisual((subVisual) => (subVisual + 1) % subVisuals);
        }, 5000);

        return () => window.clearInterval(interval);
    });

    useLayoutEffect(() => {
        if (!scaleRef.current) return;

        const onResize = () => {
            const tileSize = getTileSize(tile.size);
            const parentSize = scaleRef.current.parentElement.getBoundingClientRect();
            const scale = Math.max(parentSize.width / tileSize.width, parentSize.height / tileSize.height);
            setScale(scale);
        }

        // if (typeof ResizeObserver !== 'undefined') {
        //     const observer = new ResizeObserver(onResize);
        //     observer.observe(scaleRef.current);
        //     return () => observer.disconnect();
        // }
        // else {
        // Fallback for browsers that don't support ResizeObserver
        window.addEventListener('resize', onResize);
        onResize();
        // }

    }, [scaleRef.current, props.width, props.height]);

    const tileSize = getTileSize(tile.size);
    const style: CSSProperties = {
        width: tileSize.width,
        height: tileSize.height,
        transform: `translateY(${(-tileSize.height) * subVisual}px)`,
    }

    return (
        <div ref={scaleRef} className={'tile-scale-container'} style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <div className={`${props.className} tile-notification logo`} style={style}>
                {props.children}
            </div>
        </div>
    )
}