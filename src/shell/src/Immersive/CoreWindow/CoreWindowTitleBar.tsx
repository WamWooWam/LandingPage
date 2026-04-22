import { useState, useCallback } from "preact/hooks";
import CoreWindow from "~/Data/CoreWindow";
import CoreWindowCloseButton from "./CoreWindowCloseButton";
import CoreWindowMinimizeButton from "./CoreWindowMinimizeButton";
import PackageImage from "~/Util/PackageImage";
import { Position } from "~/Util";
import { computed } from "@preact/signals";

interface CoreWindowTitleBarProps {
    window: CoreWindow;
    iconUrl: string;
    primaryColour: string;
    isVisible: boolean;

    onMinimiseClicked?: () => void;
    onCloseClicked?: () => void;
    onDragStart?: (e: PointerEvent) => void;
}

// 
// Represents a CoreWindow's title bar
//
export default function CoreWindowTitleBar(props: CoreWindowTitleBarProps) {
    const [pointerDownPosition, setPointerDownPosition] = useState<Position | null>(null);

    const onMinimiseClicked = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        if (props.onMinimiseClicked) props.onMinimiseClicked();
    }, [props.onMinimiseClicked]);

    const onCloseClicked = useCallback((e: MouseEvent) => {
        e.stopPropagation();
        if (props.onCloseClicked) props.onCloseClicked();
    }, [props.onCloseClicked]);

    const onPointerUp = useCallback((e: PointerEvent) => {
        setPointerDownPosition(null);
        e.target!.removeEventListener("pointermove", onPointerMove as EventListener);
        e.target!.removeEventListener("pointerup", onPointerUp as EventListener);
    }, []);

    const onPointerMove = useCallback((e: PointerEvent) => {
        setPointerDownPosition(prevPos => {
            if (prevPos) {
                const dy = e.clientY - prevPos.y;
                if (Math.abs(dy) > 5) {
                    e.target!.removeEventListener("pointermove", onPointerMove as EventListener);
                    e.target!.removeEventListener("pointerup", onPointerUp as EventListener);

                    if (props.onDragStart)
                        props.onDragStart(e);
                    return null;
                }
            }
            return prevPos;
        });
    }, [props.onDragStart, onPointerUp]);

    const onPointerDown = useCallback((e: PointerEvent) => {
        setPointerDownPosition({ x: e.clientX, y: e.clientY });

        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);
        target.addEventListener("pointermove", onPointerMove);
        target.addEventListener("pointerup", onPointerUp);
    }, [onPointerMove, onPointerUp]);

    const computedTitle = computed(() =>
        props.window.signals.title.value === "" ?
            props.window.packageApplication.visualElements.displayName :
            `${props.window.signals.title.value} - ${props.window.packageApplication.visualElements.displayName}`);

    return (
        <div class={"core-window-titlebar " + (!props.isVisible ? "hidden" : "")}>
            <div class="core-window-titlebar-content"
                onPointerDown={onPointerDown}>
                {/* TODO: icon has a context menu */}
                <div class="core-window-icon-container" style={{ background: props.primaryColour }}>
                    <PackageImage url={props.iconUrl}>
                        {image => <img class="core-window-icon" src={image} alt={computed(() => props.window.signals.title.value + " icon")} />}
                    </PackageImage>
                </div>

                <div class="core-window-title">{computedTitle}</div>

                <CoreWindowMinimizeButton onClick={onMinimiseClicked} />
                <CoreWindowCloseButton onClick={onCloseClicked} />
            </div>
        </div>
    );
}