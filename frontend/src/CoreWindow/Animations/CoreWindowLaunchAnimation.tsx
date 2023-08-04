import { Component, RefObject, createRef } from "preact";
import { Position, Size } from "../../Util";
import { AnimationSlowed, EASE_APPLAUNCHFASTIN, EASE_APPLAUNCHROTATE, EASE_APPLAUNCHSCALE } from "./AnimationCommon";
import Storyboard from "../../Animation/Storyboard";
import AnimationRunner from "../../Animation/AnimationRunner";
import AnimationEvent from "../../Animation/AnimationEvent";
import CoreWindowRenderer from "../CoreWindowRenderer";


interface CoreWindowImposterProps {
    windowId: string;
    visible: boolean;
    targetPosition: Position;
    targetSize: Size;

    onAnimationComplete: () => void;
}

interface CoreWindowImposterState {
    initialX: number;
    initialY: number;
    initialZ: number;
    targetX: number;
    targetY: number;
    targetZ: number;
    initialScaleX: number;
    initialScaleY: number;
    initialRotation: number;
    isAnimating: boolean;
}

export default class CoreWindowLaunchAnimation extends Component<CoreWindowImposterProps, CoreWindowImposterState> {

    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowImposterProps) {
        super(props);

        this.rootRef = createRef();
        
        let initialSize = {
            width: this.props.targetSize.width * 0.9,
            height: this.props.targetSize.height * 0.9
        };

        const initialScaleX = initialSize.width / this.props.targetSize.width;
        const initialScaleY = initialSize.height / this.props.targetSize.height;

        const targetX = this.props.targetPosition.x
        const targetY = this.props.targetPosition.y

        const initialRotation = 200;

        this.state = {
            initialX: targetX + (this.props.targetPosition.x / 4),
            initialY: targetY,
            initialZ: -1200,
            targetX: targetX,
            targetY: targetY,
            targetZ: 0,
            initialScaleX: initialScaleX,
            initialScaleY: initialScaleY,
            initialRotation: initialRotation,
            isAnimating: true
        };
    }

    shouldComponentUpdate(nextProps: Readonly<CoreWindowImposterProps>, nextState: Readonly<CoreWindowImposterState>, nextContext: any): boolean {
        return nextState.isAnimating;
    }

    componentDidMount(): void {
        const animation = new Storyboard()
            .addLayer("x", this.state.initialX, this.state.targetX, 0.0, 0.972, EASE_APPLAUNCHFASTIN)
            .addLayer("y", this.state.initialY, this.state.targetY, 0.0, 0.972, EASE_APPLAUNCHFASTIN)
            .addLayer("z", this.state.initialZ, this.state.targetZ, 0.0, 0.972, EASE_APPLAUNCHFASTIN)
            .addLayer("width", this.state.initialScaleX, 1, 0.0, 0.947, EASE_APPLAUNCHSCALE)
            .addLayer("height", this.state.initialScaleY, 1, 0.0, 0.947, EASE_APPLAUNCHSCALE)
            .addLayer("angle", this.state.initialRotation, 180, 0.0, 1, EASE_APPLAUNCHROTATE)
            .createAnimation();

        const runner = new AnimationRunner(animation, (1 / 3)* (AnimationSlowed ? 20 : 1));
        runner.addEventListener("tick", (e: AnimationEvent) => {
            const values = e.values;
            const transform = `perspective(4000px) translate3d(${values.x}px, ${values.y}px, 0px) scale(${values.width}, ${values.height}) translate3d(0,0,${values.z}px) rotate3d(0,1,0,${values.angle}deg)`;

            this.rootRef.current.style.transform = transform;
        });

        runner.addEventListener("complete", () => {
            this.setState({ isAnimating: false });
            this.props.onAnimationComplete();
        });

        runner.start();
    }

    render() {
        let style = {
            left: "0px",
            top: "0px",
            width: this.props.targetSize.width + "px",
            height: this.props.targetSize.height + "px",
            transform: `perspective(4000px) translate3d(${this.state.initialX}px, ${this.state.initialY}px, ${this.state.initialZ}px) scale(${this.state.initialScaleX}, ${this.state.initialScaleY}) rotate3d(0,1,0,${this.state.initialRotation}deg)`
        }

        return (
            <div ref={this.rootRef} class="core-window-imposter" style={style}>
                <div class="back">
                    <div class="back-content">
                        <CoreWindowRenderer id={this.props.windowId} x={0} y={0} width={this.props.targetSize.width} height={this.props.targetSize.height} isLaunching={true} />
                    </div>
                </div>
            </div>
        );
    }
}
