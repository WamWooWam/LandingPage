import { Component, RefObject, createRef } from "preact";
import { TileVisual } from "../../Tiles/TileVisual";
import { CoreWindowInfo } from "../../Data/CoreWindowInfo";
import { TileVisualRenderer } from "../../Tiles/TileVisualRenderer";
import { TileInfo } from "../../Data/TileInfo";
import { getTileSize } from "../../Tiles/TileUtils";
import { TileSize, lightenDarkenColour2 } from "landing-page-shared";
import { CoreWindow } from "../CoreWindow";
import { Storyboard } from "../../Animation/Storyboard";
import * as bezier from "bezier-easing";
import { Position, Size } from "../../Util";
import { AnimationRunner } from "../../Animation/AnimationRunner";
import { AnimationEvent } from "../../Animation/AnimationEvent";
import { DefaultVisual } from "../../Tiles/TileRenderer";

//
// Provides a two sided element presenting both a tile and CoreWindow, used when animating between the two
//
const EASE_LINEAR = bezier(0, 0, 1, 1);
const EASE_CUBIC = bezier(0.25, 0.1, 0.25, 1);
const EASE_CIRCULAR = bezier(0.1, 0.57, 0.1, 1);
const EASE_APPLAUNCHROTATE = bezier(0.18, 0.7, 0.6, 1.0);
const EASE_APPLAUNCHROTATEBOUNCE = bezier(0.41, 0.52, 0.6, 1.4);
const EASE_APPLAUNCHDRIFT = bezier(0.41, 0.52, 0.0, 0.94);
const EASE_APPLAUNCHSCALE = bezier(0.42, 0.47, 0.3, 0.95);
const EASE_APPLAUNCHFASTIN = bezier(0.17, 0.55, 0.3, 0.95);

interface CoreWindowImposterProps {
    tile: TileInfo;
    windowId: string;
    visible: boolean;
    initialPosition: Position
    initialSize: Size;
    targetPosition: Position;
    targetSize: Size;

    onAnimationComplete: () => void;
}

interface CoreWindowImposterState {
    initialX: number;
    initialY: number;
    targetX: number;
    targetY: number;
    initialScaleX: number;
    initialScaleY: number;
    isAnimating: boolean;
}

export class CoreWindowLaunchAnimation extends Component<CoreWindowImposterProps, CoreWindowImposterState> {

    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowImposterProps) {
        super(props);
        this.rootRef = createRef();
    }

    shouldComponentUpdate(nextProps: Readonly<CoreWindowImposterProps>, nextState: Readonly<CoreWindowImposterState>, nextContext: any): boolean {
        return nextState.isAnimating;
    }

    componentWillMount(): void {
        const initialX = this.props.initialPosition.x - (this.props.targetSize.width / 2) + (this.props.initialSize.width / 2);
        const initialY = this.props.initialPosition.y - (this.props.targetSize.height / 2) + (this.props.initialSize.height / 2);
        const initialScaleX = this.props.initialSize.width / this.props.targetSize.width;
        const initialScaleY = this.props.initialSize.height / this.props.targetSize.height;

        const targetX = this.props.targetPosition.x - (this.props.targetSize.width / 2);
        const targetY = this.props.targetPosition.y - (this.props.targetSize.height / 2);

        console.log(`initialX: ${initialX}, initialY: ${initialY}, initialScaleX: ${initialScaleX}, initialScaleY: ${initialScaleY}, targetX: ${targetX}, targetY: ${targetY}`);

        this.setState({
            initialX: initialX,
            initialY: initialY,
            targetX: targetX,
            targetY: targetY,
            initialScaleX: initialScaleX,
            initialScaleY: initialScaleY,
            isAnimating: true
        });
    }

    componentDidMount(): void {
        // todo: there's multiple scenarios here, we need to handle them all
        const animation = new Storyboard()
            .addLayer("x", this.state.initialX, this.state.targetX, 0.0, 0.972, EASE_APPLAUNCHFASTIN)
            .addLayer("y", this.state.initialY, this.state.targetY, 0.0, 0.972, EASE_APPLAUNCHDRIFT)
            .addLayer("width", this.state.initialScaleX, 1, 0.0, 0.947, EASE_APPLAUNCHSCALE)
            .addLayer("height", this.state.initialScaleY, 1, 0.0, 0.947, EASE_APPLAUNCHSCALE)
            .addLayer("angle", 0, 180, 0.0, 1, EASE_APPLAUNCHROTATE)
            .addLayer("flip", 0, 1, 0, 0.5, EASE_LINEAR)
            .createAnimation();

        const runner = new AnimationRunner(animation, 2 / 3);
        runner.addEventListener("tick", (e: AnimationEvent) => {
            const values = e.values;
            const transform = `perspective(4000px) translate(${values.x}px, ${values.y}px) scale(${values.width}, ${values.height}) rotate3d(0,1,0,${values.angle}deg)`;

            this.rootRef.current.style.transform = transform;
        });

        runner.addEventListener("complete", () => {
            this.setState({ isAnimating: false });
            this.props.onAnimationComplete();
        });

        runner.start();
    }

    render() {
        const tileSize = getTileSize(this.props.tile.size);
        let tileColour = this.props.tile.app.visualElements.backgroundColor ?? "#4617b4";
        let tileColourLight = lightenDarkenColour2(tileColour, 0.05);
        let frontStyle = { background: `linear-gradient(to right, ${tileColour}, ${tileColourLight})` }
        let classList = ["tile-container", TileSize[this.props.tile.size]];

        console.log(this.props.tile.visual);

        let style = {
            left: "0px",
            top: "0px",
            width: this.props.targetSize.width + "px",
            height: this.props.targetSize.height + "px",
            transform: `perspective(4000px) translate(${this.state.initialX}px, ${this.state.initialY}px) scale(${this.state.initialScaleX}, ${this.state.initialScaleY}) rotateY(0deg)`
        }

        return (
            <div ref={this.rootRef} class="core-window-imposter" style={style}>
                <div class="front">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${tileSize.width} ${tileSize.height}`} preserveAspectRatio="none">
                        <foreignObject width={tileSize.width + "px"} height={tileSize.height + "px"}>
                            <div className={classList.join(" ")} >
                                <div class="tile" style={frontStyle}>
                                    <TileVisualRenderer app={this.props.tile.app} size={this.props.tile.size} visual={this.props.tile.visual} />
                                    <div className={"tile-toast-footer" + (!this.props.tile.visual || this.props.tile.visual === DefaultVisual as TileVisual ? " hidden" : "")}>
                                        <img className="tile-badge-icon" src={this.props.tile.app.visualElements.square30x30Logo} alt={""} />
                                    </div>
                                </div>
                                <div className="tile-border"
                                    style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                            </div>
                        </foreignObject>
                    </svg>
                </div>
                <div class="back">
                    <div class="back-content">
                        <CoreWindow id={this.props.windowId} x={0} y={0} width={this.props.targetSize.width} height={this.props.targetSize.height} isLaunching={true} />
                    </div>
                </div>
            </div>
        );
    }
}
