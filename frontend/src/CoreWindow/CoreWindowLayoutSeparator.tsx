import CoreWindow from "../Data/CoreWindow";
import CoreWindowSeparatorGrip from "../../static/9611.png";

interface CoreWindowLayoutSeparatorProps {
    x: number;
    y: number;
    height: number;
    left: CoreWindow;
    right: CoreWindow;
}

export function CoreWindowLayoutSeparator(props: CoreWindowLayoutSeparatorProps) {
    return (
        <div class="core-window-layout-separator" style={{ top: props.y, left: props.x, height: props.height }}>
            <img src={CoreWindowSeparatorGrip} draggable={false} alt="Separator Grip" />
        </div>
    );
}
