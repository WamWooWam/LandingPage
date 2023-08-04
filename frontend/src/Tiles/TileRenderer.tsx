import { Component, Ref, RefObject, createRef } from "preact";
import { useContext } from "preact/hooks";
import { WebPContext } from "../Root";
import { fixupUrl } from "../Util";
import { getTileSize } from "./TileUtils";
import { TileSize } from "shared/TileSize";
import { Package } from "shared/Package";
import { PackageApplication } from "shared/PackageApplication";
import { lightenDarkenColour2 } from "shared/ColourUtils";
import PackageRegistry from "../Data/PackageRegistry";
import TileVisual from "./TileVisual";
import TileVisualRenderer from "./TileVisualRenderer";
import TileUpdateManager from "./TileUpdateManager";
import TileDefaultVisual from "./TileDefaultVisual";
import Events from "../Events";
import AppLaunchRequestedEvent from "../Events/AppLaunchRequestedEvent";
import "./tile.scss"

export interface TileProps {
    packageName?: string;
    appId: string;
    size: TileSize;
    fence?: boolean;
    row?: number,
    column?: number;
    key?: string;
    animColumn?: number;
    style?: any;
}

interface TileState {
    pack: Package;
    app: PackageApplication;
    pressState?: "none" | "top" | "bottom" | "left" | "right" | "center";

    visualIdx: number;
    nextVisualIdx?: number;
    visuals: TileVisual[]
    visible: boolean;

    swapping: boolean;
    clicked: boolean;

    interval?: any;
    noStyle?: boolean;
}

export default class TileRenderer extends Component<TileProps, TileState> {
    // BUGBUG: this should be possible without a ref
    private root: RefObject<HTMLAnchorElement>;

    constructor(props: TileProps) {
        super(props);
        let { pack, app } = this.getAppAndPackage(props);
        this.state = {
            app,
            pack,
            pressState: "none",
            visuals: [TileDefaultVisual],
            visualIdx: 0,
            swapping: false,
            clicked: false,
            visible: true
        };

        this.root = createRef();
    }

    componentDidUpdate(previousProps: Readonly<TileProps>, previousState: Readonly<TileState>, snapshot: any): void {
        if (this.props.packageName !== previousProps.packageName || this.props.appId !== previousProps.appId) {
            let { pack, app } = this.getAppAndPackage();

            clearInterval(this.state.interval);

            this.setState({ pack, app, visualIdx: 0, visuals: [TileDefaultVisual], nextVisualIdx: undefined });
        }
    }

    componentDidMount() {
        TileUpdateManager.getInstance()
            .registerVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));

        if (this.props.style?.entryDelay) {
            setTimeout(() => this.setState({ noStyle: true }), this.props.style.entryDelay);
        }
    }

    componentWillUnmount() {
        TileUpdateManager.getInstance()
            .unregisterVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));
    }

    didGetVisuals(visuals: Map<TileSize, TileVisual[]>) {
        let tileVisuals = [TileDefaultVisual, ...visuals.get(this.props.size)];
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

    onAnimationEnded(e: AnimationEvent) {
        this.setState((s) => {
            let visuals = [...s.visuals];
            let visualIdx = s.visualIdx;
            if (visuals[0] === TileDefaultVisual) {
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

    // BUGBUG: these really should be pointer events, but they prevent scrolling on iOS 
    onMouseDown(e: MouseEvent) {
        this.updatePressState(e);
    }

    onMouseUp(e: MouseEvent) {
        this.setState({ pressState: "none" });
    }

    onClick(e: MouseEvent) {
        this.updatePressState(e);
        if (this.state.app.load) {
            e.preventDefault();
            this.setState({ clicked: false, visible: false });

            const bounds = this.root.current.getBoundingClientRect();
            const event = new AppLaunchRequestedEvent(this.state.pack, this.state.app, {
                tileX: bounds.x,
                tileY: bounds.y,
                tileWidth: bounds.width,
                tileHeight: bounds.height,
                tileVisual: this.state.visuals[this.state.visualIdx],
                tileSize: this.props.size
            });

            Events.getInstance().dispatchEvent(event);

            setTimeout(() => {
                this.setState({ visible: true });
            }, 1000);
        }
    }

    render(props: TileProps, state: TileState) {
        let hasWebP = useContext(WebPContext);
        let containerStyle: any = {
            'grid-row-start': props.row !== undefined ? (props.row + 2).toString() : undefined,
            'grid-column-start': props.column !== undefined ? (props.column + 1).toString() : undefined,
            visibility: state.visible ? undefined : "hidden",
            opacity: "1",
            ...((props.style) ? props.style : {})
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
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onClick={this.onClick.bind(this)}
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

        let href = state.app.startPage;
        if (state.app.load) {
            href = `/app/${state.pack.identity.packageFamilyName}/${state.app.id}`;
        }

        //let size = this.getTileSize(props.size)
        return (
            <>
                <a ref={this.root}
                    class={classList.join(" ")}
                    style={containerStyle}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onClick={this.onClick.bind(this)}
                    title={state.app.visualElements.displayName}
                    aria-label={state.app.visualElements.displayName}
                    href={href}>
                    <div class="tile">
                        <div class="front" style={frontStyle}>
                            <TileVisualRenderer app={state.app} visual={visual} size={props.size} />
                        </div>
                        {state.swapping &&
                            <div class="next" style={frontStyle} onAnimationEnd={this.onAnimationEnded.bind(this)}>
                                <TileVisualRenderer app={state.app} visual={nextVisual} size={props.size} />
                            </div>
                        }
                        <div className={"tile-toast-footer" + (!visual || visual === TileDefaultVisual ? " hidden" : "")}>
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
        let app = pack?.applications[props.appId];
        if (!app) console.warn(`App ${props.appId} in package ${props.packageName} not found!`);
        return { pack, app };
    }

    private updatePressState(e: PointerEvent | MouseEvent) {
        const size = getTileSize(this.props.size);
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
}