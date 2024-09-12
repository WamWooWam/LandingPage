import { CoreWindowAnimation } from "./CoreWindowContainer";
import CoreWindowLaunchAnimation from "./Animations/CoreWindowLaunchAnimation";
import CoreWindowLaunchAnimationFromTile from "./Animations/CoreWindowLaunchAnimationFromTile";
import CoreWindowMobileLaunchAnimation from "./Animations/CoreWindowMobileLaunchAnimation";

export default function CoreWindowLaunchAnimationContainer(props: CoreWindowAnimation) {
    if (!props.params) return null;
    
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
