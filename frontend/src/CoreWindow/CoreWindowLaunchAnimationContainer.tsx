import { CoreWindowAnimation } from "./CoreWindowContainer";
import CoreWindowLaunchAnimation from "./Animations/CoreWindowLaunchAnimation";
import CoreWindowLaunchAnimationFromTile from "./Animations/CoreWindowLaunchAnimationFromTile";
import CoreWindowMobileLaunchAnimation from "./Animations/CoreWindowMobileLaunchAnimation";
import LayoutState from "../LayoutState";
import { LayoutStateContext } from "../Root";
import { useContext } from "preact/hooks";

export default function CoreWindowLaunchAnimationContainer(props: CoreWindowAnimation) {
    if (!props.params) return null;

    const isMobile = useContext(LayoutStateContext) === LayoutState.windowsPhone81;
    if (isMobile) {
        return <CoreWindowMobileLaunchAnimation
            key={props.params.window.id}
            windowId={props.params.window.id}
            visible={true}
            targetPosition={props.params.targetPosition}
            targetSize={props.params.targetSize}
            onAnimationComplete={props.onAnimationComplete} />
    }

    // should these not be merged into one animation?
    if (props.params.origin?.tile) {
        return (
            <CoreWindowLaunchAnimationFromTile
                key={props.params.window.id}
                windowId={props.params.window.id}
                tile={props.params.origin.tile} visible={true}
                initialPosition={props.params.origin.position}
                initialSize={props.params.origin.size}
                targetPosition={props.params.targetPosition}
                targetSize={props.params.targetSize}
                onAnimationComplete={props.onAnimationComplete} />
        );
    }
    else {
        return (
            <CoreWindowLaunchAnimation
                key={props.params.window.id}
                windowId={props.params.window.id} visible={true}
                targetPosition={props.params.targetPosition}
                targetSize={props.params.targetSize}
                onAnimationComplete={props.onAnimationComplete} />
        );
    }
}
