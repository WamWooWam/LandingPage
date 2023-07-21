import { Component, RefObject, createRef } from "preact";
import { getTileSize } from "../../Tiles/TileUtils";
import { TileSize } from "shared/TileSize";
import { lightenDarkenColour2 } from "shared/ColourUtils";
import { Position, Size } from "../../Util";
import { EASE_APPLAUNCHDRIFT, EASE_APPLAUNCHFASTIN, EASE_APPLAUNCHROTATE, EASE_APPLAUNCHSCALE, EASE_LINEAR } from "./AnimationCommon";
import TileVisual from "../../Tiles/TileVisual";
import TileVisualRenderer from "../../Tiles/TileVisualRenderer";
import TileInfo from "../../Data/TileInfo";
import TileDefaultVisual from "../../Tiles/TileDefaultVisual";
import Storyboard from "../../Animation/Storyboard";
import AnimationRunner from "../../Animation/AnimationRunner";
import AnimationEvent from "../../Animation/AnimationEvent";
import CoreWindowRenderer from "../CoreWindowRenderer";

//
// Provides a two sided element presenting both a tile and CoreWindow, used when animating between the two
//
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

export default class CoreWindowLaunchAnimationFromTile extends Component<CoreWindowImposterProps, CoreWindowImposterState> {

    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowImposterProps) {
        super(props);
        this.rootRef = createRef();

        const initialX = this.props.initialPosition.x - (this.props.targetSize.width / 2) + (this.props.initialSize.width / 2);
        const initialY = this.props.initialPosition.y - (this.props.targetSize.height / 2) + (this.props.initialSize.height / 2);
        const initialScaleX = this.props.initialSize.width / this.props.targetSize.width;
        const initialScaleY = this.props.initialSize.height / this.props.targetSize.height;

        const targetX = this.props.targetPosition.x;
        const targetY = this.props.targetPosition.y
        this.state = {
            initialX: initialX,
            initialY: initialY,
            targetX: targetX,
            targetY: targetY,
            initialScaleX: initialScaleX,
            initialScaleY: initialScaleY,
            isAnimating: true
        };
    }

    shouldComponentUpdate(nextProps: Readonly<CoreWindowImposterProps>, nextState: Readonly<CoreWindowImposterState>, nextContext: any): boolean {
        return nextState.isAnimating;
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

        const runner = new AnimationRunner(animation, (2 / 3));
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

        let tileBounds = getTileSize(this.props.tile.size);

        let style = {
            left: "0px",
            top: "0px",
            width: this.props.targetSize.width + "px",
            height: this.props.targetSize.height + "px",
            transform: `perspective(4000px) translate(${this.state.initialX}px, ${this.state.initialY}px) scale(${this.state.initialScaleX}, ${this.state.initialScaleY}) rotateY(0deg)`
        }

        let tileStyle = {
            width: tileSize.width + "px",
            height: tileSize.height + "px",
            transform: `scale(${this.props.targetSize.width / tileBounds.width}, ${this.props.targetSize.height / tileBounds.height})`,
            transformOrigin: "top left"
        }

        return (
            <div ref={this.rootRef} class="core-window-imposter" style={style}>
                <div class="front">
                    {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${tileSize.width} ${tileSize.height}`} preserveAspectRatio="none">
                        <foreignObject width={tileSize.width + "px"} height={tileSize.height + "px"}> */}
                    <div className={classList.join(" ")} style={tileStyle}>
                        <div class="tile" style={frontStyle}>
                            <TileVisualRenderer app={this.props.tile.app} size={this.props.tile.size} visual={this.props.tile.visual} />
                            <div className={"tile-toast-footer" + (!this.props.tile.visual || this.props.tile.visual === TileDefaultVisual as TileVisual ? " hidden" : "")}>
                                <img className="tile-badge-icon" src={this.props.tile.app.visualElements.square30x30Logo} alt={""} />
                            </div>
                        </div>
                        <div className="tile-border"
                            style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                    {/* </foreignObject>
                    </svg> */}
                </div>
                <div class="back">
                    <div class="back-content">
                        <CoreWindowRenderer id={this.props.windowId} x={0} y={0} width={this.props.targetSize.width} height={this.props.targetSize.height} isLaunching={true} />
                    </div>
                </div>
            </div>
        );
    }
}
