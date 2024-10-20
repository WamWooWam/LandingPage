import { useContext, useEffect, useState } from "preact/hooks";

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
    const tile = useContext(TileContext);

    const [subVisual, setSubVisual] = useState<number>(0);
    useEffect(() => {
        const tileSize = getTileSize(tile.size);
        const subVisuals = Math.ceil(props.height / tileSize.height);
        if (subVisuals <= 1) return;

        const interval = window.setInterval(() => {
            setSubVisual((subVisual) => (subVisual + 1) % subVisuals);
        }, 5000);

        return () => window.clearInterval(interval);
    });

    const tileSize = getTileSize(tile.size);
    const style = {
        width: tileSize.width,
        height: tileSize.height,
        transform: `translateY(${(-tileSize.height) * subVisual}px)`,
    }

    return (
        <div className={`${props.className} tile-notification logo`} style={style}>
            {props.children}
        </div>
    )
}