import { Component, RefObject, createRef } from "preact";
import { Position, Size } from "../../Util";
import { AnimationSlowed, EASE_APPLAUNCHFASTIN, EASE_APPLAUNCHROTATE, EASE_APPLAUNCHSCALE, EASE_LINEAR } from "./AnimationCommon";
import Storyboard from "../../Animation/Storyboard";
import AnimationRunner from "../../Animation/AnimationRunner";
import AnimationEvent from "../../Animation/AnimationEvent";
import CoreWindowRenderer from "../CoreWindowRenderer";


interface CoreWindowImposterProps {
    windowId: string;
    visible: boolean;
    initialPosition: Position
    initialSize: Size;

    onAnimationComplete: () => void;
}

interface CoreWindowImposterState {
    isAnimating: boolean;
}

export default class CoreWindowCloseAnimation extends Component<CoreWindowImposterProps, CoreWindowImposterState> {

    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowImposterProps) {
        super(props);
        this.rootRef = createRef();
    }

    shouldComponentUpdate(nextProps: Readonly<CoreWindowImposterProps>, nextState: Readonly<CoreWindowImposterState>, nextContext: any): boolean {
        return nextState.isAnimating;
    }

    componentDidMount(): void {
        this.setState({ isAnimating: true });

        // todo: there's multiple scenarios here, we need to handle them all
        const animation = new Storyboard()
            .addLayer("scale", 1.0, 0.94, 0.0, 0.947, EASE_APPLAUNCHFASTIN)
            .addLayer("opacity", 1.0, 0.0, 0.0, 0.947, EASE_APPLAUNCHFASTIN)
            .createAnimation();

        const runner = new AnimationRunner(animation, (1 / 6) * (AnimationSlowed ? 20 : 1));
        runner.addEventListener("tick", (e: AnimationEvent) => {
            const values = e.values;
            const transform = `scale(${values.scale})`;

            this.rootRef.current.style.transform = transform;
            this.rootRef.current.style.opacity = `${values.opacity}`;
        });

        runner.addEventListener("complete", () => {
            this.setState({ isAnimating: false });
            this.props.onAnimationComplete();
        });

        runner.start();
    }

    render() {
        let style = {
            left: `${this.props.initialPosition.x}px`,
            top: `${this.props.initialPosition.y}px`,
            width: this.props.initialSize.width + "px",
            height: this.props.initialSize.height + "px",
            transform: `scale(1)`
        }

        return (
            <div ref={this.rootRef} class="core-window-imposter" style={style}>
                <div class="front">
                    <CoreWindowRenderer id={this.props.windowId} x={0} y={0} width={this.props.initialSize.width} height={this.props.initialSize.height} isLaunching={true} />
                </div>
            </div>
        );
    }
}
