import { Component, RefObject, createRef } from 'preact';
import { Position, Size } from '~/Util';
import Storyboard from '~/Animation/Storyboard';
import AnimationRunner from '~/Animation/AnimationRunner';
import AnimationEvent from '~/Animation/AnimationEvent';
import CoreWindowRenderer from '../CoreWindowRenderer';
import bezier from 'bezier-easing';

const EASE_OUT_SINE = bezier(0.61, 1, 0.88, 1);
const EASE_OUT_EXPO = bezier(0.22, 1, 0.36, 1);

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

export default class CoreWindowMobileLaunchAnimation extends Component<
    CoreWindowImposterProps,
    CoreWindowImposterState
> {
    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowImposterProps) {
        super(props);

        this.rootRef = createRef();

        let initialSize = {
            width: this.props.targetSize.width * 0.9,
            height: this.props.targetSize.height * 0.9,
        };

        const initialScaleX = initialSize.width / this.props.targetSize.width;
        const initialScaleY = initialSize.height / this.props.targetSize.height;

        const targetX = this.props.targetPosition.x;
        const targetY = this.props.targetPosition.y;

        const initialRotation = 90;

        this.state = {
            initialX: targetX + this.props.targetPosition.x / 4,
            initialY: targetY,
            initialZ: -1200,
            targetX: targetX,
            targetY: targetY,
            targetZ: 0,
            initialScaleX: initialScaleX,
            initialScaleY: initialScaleY,
            initialRotation: initialRotation,
            isAnimating: true,
        };
    }

    shouldComponentUpdate(
        nextProps: Readonly<CoreWindowImposterProps>,
        nextState: Readonly<CoreWindowImposterState>,
        nextContext: any,
    ): boolean {
        return nextState.isAnimating;
    }

    componentDidMount(): void {
        const animation = new Storyboard()
            .addLayer('angle', 90, 0, 0.2, 0.35, EASE_OUT_EXPO)
            .addLayer('opacity', 0, 1, 0.2, 0.01, EASE_OUT_SINE)
            .createAnimation();

        const runner = new AnimationRunner(animation, 1);
        runner.addEventListener('tick', (e: AnimationEvent) => {
            const values = e.values;
            const transform = `perspective(666px) rotate3d(0,1,0,${values.angle}deg)`;

            this.rootRef.current.style.transform = transform;
            this.rootRef.current.style.opacity = values.opacity;
        });

        runner.addEventListener('complete', () => {
            this.setState({ isAnimating: false });
            this.props.onAnimationComplete();
        });

        runner.start();
    }

    render() {
        let style = {
            left: '0px',
            top: '0px',
            width: this.props.targetSize.width + 'px',
            height: this.props.targetSize.height + 'px',
            transform: `rotate3d(0,1,0,${this.state.initialRotation}deg)`,
            transformOrigin: 'center left',
            opacity: 0,
        };

        return (
            <div ref={this.rootRef} class="core-window-imposter" style={style}>
                <div class="front">
                    <CoreWindowRenderer
                        id={this.props.windowId}
                        x={0}
                        y={0}
                        width={this.props.targetSize.width}
                        height={this.props.targetSize.height}
                        isLaunching={true}
                    />
                </div>
            </div>
        );
    }
}
