import { Component } from "preact";
import { useContext } from "preact/hooks";
import { PackageApplication } from "../Data/PackageApplication";
import { Package } from "../Data/Package";
import { PackageRegistry } from "../Data/PackageRegistry";
import { TileVisual } from "./TileVisual";
import { TileVisualRenderer } from "./TileVisualRenderer";
import { MobileContext } from "../Root";
import { TileBackgroundRenderer } from "./TileBackgroundRenderer";
import { TileSize } from "../../../shared/TileSize";
import { lightenDarkenColour2 } from "../../../shared/ColourUtils";
import { getVisuals } from "./TileToast"
import "./tile.css"
import { TileUpdateManager } from "./TileUpdateManager";

export interface TileProps {
    packageName?: string;
    appId: string;
    size: TileSize;
    fence?: boolean;
    row?: number,
    column?: number;
    key?: string;
}

interface TileState {
    pack: Package;
    app: PackageApplication;
    pressState?: "none" | "top" | "bottom" | "left" | "right" | "center";

    tileColour: string;
    tileColourLight: string;

    visualIdx: number;
    nextVisualIdx?: number;
    visuals: TileVisual[]

    swapping: boolean;

    interval?: any;
}

const DefaultVisual: TileVisual = {} as TileVisual;

export class TileRenderer extends Component<TileProps, TileState> {

    constructor(props: TileProps) {
        super(props);
        this.state = {
            app: null,
            pack: null,
            tileColour: null,
            tileColourLight: null,
            pressState: "none",
            visuals: [DefaultVisual],
            visualIdx: 0,
            swapping: false
        }
    }

    // derrive state
    static getDerivedStateFromProps(props: TileProps, state: TileState) {
        let pack = PackageRegistry.getPackage(props.packageName);
        if (!pack)
            console.warn("Package " + props.packageName + " not found!");

        let app = pack?.applications.get(props.appId);
        if (!app)
            console.warn("App " + props.appId + " in package " + props.packageName + " not found!");

        let tileColour = app?.visualElements.backgroundColor ?? "#4617b4";
        let tileColourLight = lightenDarkenColour2(tileColour, 0.05);

        return { pack, app, tileColour, tileColourLight };
    }

    componentDidMount() {
        TileUpdateManager.getInstance()
            .registerVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));
    }

    componentWillUnmount() {
        TileUpdateManager.getInstance()
            .unregisterVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));
    }

    didGetVisuals(visuals: Map<TileSize, TileVisual[]>) {
        let tileVisuals = [DefaultVisual, ...visuals.get(this.props.size)];
        if (tileVisuals.length > 1) {
            // random difference between +- 2 secs
            let interval = setInterval(() => this.updateBinding(), 5000 + Math.random() * 4000);

            this.setState({ visuals: tileVisuals, visualIdx: 0, interval });
            this.updateBinding()
        }
    }

    updateBinding() {
        // we need to transition from the previous visual to the next visual
        this.setState({ swapping: true });
    }

    pointerEntered(e: PointerEvent) {
        this.updatePressState(e);
    }

    pointerExited(e: PointerEvent) {
        this.setState({ pressState: "none" });
    }

    pointerMoved(e: PointerEvent) {
        if (!e.buttons)
            this.updatePressState(e);
    }

    onAnimationEnded(e: AnimationEvent) {
        this.setState((s) => {
            let visuals = [...s.visuals];
            let visualIdx = s.visualIdx;
            if (visuals[0] === DefaultVisual) {
                visuals = visuals.slice(1);
            }
            else {
                visualIdx = (visualIdx + 1) % visuals.length;
            }

            return ({
                visuals,
                visualIdx,
                swapping: false
            })
        });
    }

    render(props: TileProps, state: TileState) {
        // let isMobile = useContext(MobileContext);
        let isMobile = false; // disable for now

        let containerStyle = {
            gridRowStart: props.row !== undefined ? props.row + 2 : undefined,
            gridColumnStart: props.column !== undefined ? props.column + 1 : undefined,
        }

        if (!state.pack || !state.app) {
            return (
                <a class={`tile-container ${TileSize[props.size]}`}
                    style={containerStyle}>
                    <div class="tile" />
                </a>
            );
        }


        let classList = ["tile-container", TileSize[props.size], "press-" + state.pressState];
        let tileColour = state.tileColour;
        let frontStyle = {};
        if (state.app.visualElements.foregroundText === "light")
            classList.push("text-light");
        else
            classList.push("text-dark");

        if (!isMobile) {
            frontStyle = {
                background: `linear-gradient(to right, ${tileColour}, ${state.tileColourLight})`
            }
        }
        else {

        }

        let visual = state.visuals[state.visualIdx];
        let nextVisual = state.visuals[(state.visualIdx + 1) % state.visuals.length];

        //let size = this.getTileSize(props.size)
        return (
            <>
                <a class={classList.join(" ")}
                    style={containerStyle}
                    onPointerEnter={this.pointerEntered.bind(this)}
                    onPointerLeave={this.pointerExited.bind(this)}
                    onPointerMove={this.pointerMoved.bind(this)}
                    title={state.app.visualElements.displayName}
                    aria-label={state.app.visualElements.displayName}
                    href={state.app.startPage}>
                    {isMobile && <TileBackgroundRenderer />}
                    <div class="tile">
                        <div class="front" style={frontStyle}>
                            <TileVisualRenderer app={state.app} visual={visual} size={props.size} />
                        </div>
                        {state.swapping &&
                            <div class={"next"} style={frontStyle} onAnimationEnd={this.onAnimationEnded.bind(this)}>
                                <TileVisualRenderer app={state.app} visual={nextVisual} size={props.size} />
                            </div>
                        }
                        <div className={"tile-toast-footer" + (!visual || visual === DefaultVisual ? " hidden" : "")}>
                            <img className="tile-badge-icon" src={state.app.visualElements.square30x30Logo} alt={""} />
                        </div>
                    </div>
                    <div className="tile-border"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                </a>
            </>
        )
    }

    private updatePressState(e: PointerEvent) {
        const size = this.getTileSize(this.props.size);
        const offsetX = Math.max(0, Math.min(e.offsetX, size.width));
        const offsetY = Math.max(0, Math.min(e.offsetY, size.height));

        if ((offsetX >= (size.width * 0.33) && offsetX <= (size.width * 0.66)) &&
            (offsetY >= (size.height * 0.33) && offsetY <= (size.height * 0.66))) {
            this.setState({ pressState: "center" })
        }
        else {
            var distanceToPositive = { x: offsetX, y: offsetY }
            var distanceToNegative = { x: (size.width - offsetX), y: (size.height - offsetY) }

            let smallestX = Math.min(distanceToPositive.x, distanceToNegative.x);
            let smallestY = Math.min(distanceToPositive.y, distanceToNegative.y);
            let smallestDistance = Math.min(smallestX, smallestY);

            if (smallestDistance == distanceToPositive.x)
                this.setState({ pressState: "left" })
            else if (smallestDistance == distanceToNegative.x)
                this.setState({ pressState: "right" })
            else if (smallestDistance == distanceToNegative.y)
                this.setState({ pressState: "bottom" })
            else
                this.setState({ pressState: "top" })
        }
    }

    private getTileSize(size: TileSize) {
        switch (size) {
            case TileSize.square70x70:
                return { width: 56, height: 56 };
            case TileSize.square150x150:
                return { width: 120, height: 120 };
            case TileSize.wide310x150:
                return { width: 248, height: 120 };
            case TileSize.square310x310:
                return { width: 248, height: 248 };
        }
    }
}