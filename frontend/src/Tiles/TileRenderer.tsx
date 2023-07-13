import { Component } from "preact";
import { useContext } from "preact/hooks";
import { PackageRegistry } from "../Data/PackageRegistry";
import { TileVisual } from "./TileVisual";
import { TileVisualRenderer } from "./TileVisualRenderer";
import { MobileContext, WebPContext } from "../Root";
import { TileBackgroundRenderer } from "./TileBackgroundRenderer";
import { TileUpdateManager } from "./TileUpdateManager";
import { fixupUrl } from "../Util";
import { getVisuals } from "./TileToast"

import { TileSize, lightenDarkenColour2, PackageApplication, Package } from "landing-page-shared";

import "./tile.css"

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

        let { pack, app } = this.getAppAndPackage(props);

        this.state = {
            app,
            pack,
            pressState: "none",
            visuals: [DefaultVisual],
            visualIdx: 0,
            swapping: false
        }
    }

    componentDidUpdate(previousProps: Readonly<TileProps>, previousState: Readonly<TileState>, snapshot: any): void {
        if (this.props.packageName !== previousProps.packageName || this.props.appId !== previousProps.appId) {
            let { pack, app } = this.getAppAndPackage();

            clearInterval(this.state.interval);

            this.setState({ pack, app, visualIdx: 0, visuals: [DefaultVisual], nextVisualIdx: undefined });
        }
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
            if (this.state.interval)
                clearInterval(this.state.interval);
            let interval = setInterval(() => this.updateBinding(), 10000 + (Math.random() * 5000));

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
        // if the current element is "active" then we dont want to change the state
        if (e.buttons !== 0) {
            return;
        }

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
        let hasWebP = useContext(WebPContext);

        let containerStyle = {
            gridRowStart: props.row !== undefined ? props.row + 2 : undefined,
            gridColumnStart: props.column !== undefined ? props.column + 1 : undefined,
        }

        let tileColour = state.app?.visualElements.backgroundColor ?? "#4617b4";
        let tileColourLight = lightenDarkenColour2(tileColour, 0.05);
        let frontStyle = {
            background: `linear-gradient(to right, ${tileColour}, ${tileColourLight})`
        }

        let classList = ["tile-container", TileSize[props.size], "press-" + state.pressState];

        if (!state.pack || !state.app) {
            return (
                <a class={classList.join(" ")}
                    onPointerEnter={this.pointerEntered.bind(this)}
                    onPointerLeave={this.pointerExited.bind(this)}
                    onPointerMove={this.pointerMoved.bind(this)}
                    style={containerStyle}>
                    <div class="tile" style={frontStyle} />
                    <div className="tile-border"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                </a>
            );
        }


        if (state.app.visualElements.foregroundText === "light")
            classList.push("text-light");
        else
            classList.push("text-dark");

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
                    <div class="tile">
                        <div class="front" style={frontStyle}>
                            <TileVisualRenderer app={state.app} visual={visual} size={props.size} />
                        </div>
                        {state.swapping &&
                            <div class="next" style={frontStyle} onAnimationEnd={this.onAnimationEnded.bind(this)}>
                                <TileVisualRenderer app={state.app} visual={nextVisual} size={props.size} />
                            </div>
                        }
                        <div className={"tile-toast-footer" + (!visual || visual === DefaultVisual ? " hidden" : "")}>
                            <img className="tile-badge-icon" src={fixupUrl(state.app.visualElements.square30x30Logo, hasWebP)} alt={""} />
                        </div>
                    </div>
                    <div className="tile-border"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                </a>
            </>
        )
    }

    private getAppAndPackage(props: TileProps = this.props) {
        let pack = PackageRegistry.getPackage(props.packageName);
        if (!pack) console.warn(`Package ${props.packageName} not found!`);
        let app = pack?.applications.get(props.appId);
        if (!app) console.warn(`App ${props.appId} in package ${props.packageName} not found!`);
        return { pack, app };
    }

    private updatePressState(e: PointerEvent) {
        const size = this.getTileSize(this.props.size);
        const offsetX = Math.max(0, Math.min(e.offsetX, size.width));
        const offsetY = Math.max(0, Math.min(e.offsetY, size.height));

        if ((offsetX >= (size.width * 0.30) && offsetX <= (size.width * 0.70)) &&
            (offsetY >= (size.height * 0.30) && offsetY <= (size.height * 0.70))) {
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