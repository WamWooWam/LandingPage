import { RenderableProps } from "preact";
import { useRef } from "preact/hooks";

type Rectangle = {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

type TileNotificationBindingProps = {
    className: string;

    dynamicFormat?: boolean;
    forceBadgePlate?: boolean;
    singleLineYOffset?: string;

    logoMargins?: Rectangle;
    badgeMargins?: Rectangle;
    logoAndBadgeMargins?: Rectangle;
    peekMargins?: Rectangle;
}

export default function TileNotificationBinding(props: RenderableProps<TileNotificationBindingProps>) {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className={`tile-binding ${props.className}`}>
            {props.children}
        </div>
    )
}