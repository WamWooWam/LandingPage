import "./tile.scss"

import { Component, ErrorInfo, Ref, RefObject, createContext, createRef } from "preact";
import ConfigurationManager, { AppStatus } from "~/Data/ConfigurationManager";

import AppLaunchRequestedEvent from "~/Events/AppLaunchRequestedEvent";
import Events from "~/Events";
import MessageDialog from "~/Data/MessageDialog";
import { Package } from "shared/Package";
import { PackageApplication } from "shared/PackageApplication";
import PackageImage from "../../../Util/PackageImage";
import PackageRegistry from "~/Data/PackageRegistry";
import TileBadge from "./TileBadge";
import { TileBranding } from "./TileBranding";
import TileDefaultVisual from "./TileDefaultVisual";
import { TileSize } from "shared/TileSize";
import TileTemplates from "./TileTemplates";
import TileUpdateManager from "./TileUpdateManager";
import TileVisual from "../../../Data/TileVisual";
import TileVisualRenderer from "./TileVisualRenderer";
import UICommand from "~/Data/UICommand";
import { getTileSize } from "./TileUtils";
import { isMobile } from "~/Util";
import { lightenDarkenColour2 } from "shared/ColourUtils";

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

    appStatus?: AppStatus;

    pressState?: "none" | "top" | "bottom" | "left" | "right" | "center";

    visualIdx: number;
    nextVisualIdx?: number;
    visuals: TileVisual[]
    visible: boolean;

    swapping: boolean;
    clicked: boolean;

    interval?: any;
    noStyle?: boolean;

    error: string | null
}

interface TileContextData {
    pack: Package;
    app: PackageApplication;
    size: TileSize;
}

export const TileContext = createContext<TileContextData>(null);

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
            visuals: [],
            visualIdx: -1,
            swapping: false,
            clicked: false,
            visible: true,
            error: null
        };

        this.root = createRef();
    }

    componentDidUpdate(previousProps: Readonly<TileProps>, previousState: Readonly<TileState>, snapshot: any): void {
        if (this.props.packageName !== previousProps.packageName || this.props.appId !== previousProps.appId) {
            let { pack, app } = this.getAppAndPackage();
            clearInterval(this.state.interval);

            TileUpdateManager.getInstance()
                .unregisterVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));

            this.setState({ pack, app, visualIdx: 0, visuals: [TileDefaultVisual], nextVisualIdx: undefined });
        }

        if (!previousState.appStatus && this.state.appStatus) {
            if (this.state.appStatus.statusCode === 0) {
                TileUpdateManager.getInstance()
                    .registerVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));
            }
        }
    }

    componentDidMount() {
        ConfigurationManager.getAppStatus(this.state.app, this.state.pack)
            .then((status) => {
                this.setState({ appStatus: status });
            });
    }

    componentDidCatch(error: any, errorInfo: ErrorInfo): void {
        console.error(error);

        TileUpdateManager.getInstance()
            .unregisterVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));

        this.setState(() => {
            clearInterval(this.state.interval);

            // tile safe mode, show the default visual
            return { error: error.toString(), visuals: [TileDefaultVisual], nextVisualIdx: undefined, visualIdx: 0, swapping: false };
        });
    }

    componentWillUnmount() {
        TileUpdateManager.getInstance()
            .unregisterVisualUpdateCallback(this.state.app, this.didGetVisuals.bind(this));
    }

    didGetVisuals(visuals: Map<TileSize, TileVisual[]>) {
        if (this.state.interval)
            clearInterval(this.state.interval);

        let tileVisuals = visuals.get(this.props.size);
        if (tileVisuals.length > 0) {
            // Promise.race(tileVisuals.flatMap(f => f.bindings).map(s => TileTemplates[s.template as keyof typeof TileTemplates]()))
            //     .then(() => {
            let interval = setInterval(() => this.updateBinding(), 10000 + (Math.random() * 5000));

            this.setState({ visuals: tileVisuals, interval });
            this.updateBinding()
            // })
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
            visualIdx = (visualIdx + 1) % visuals.length;

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
        if (this.state.appStatus?.statusCode != 0) {
            e.preventDefault();

            let dialog = new MessageDialog(
                `${this.state.app.visualElements.displayName} appears to have been corrupted. Running this app might put your PC at risk.\r\n<a target="_blank" href="https://www.sec.gov/Archives/edgar/data/1418091/000110465922048128/tm2213229d1_sc13da.htm">More info</a>`,
                "Start protected your PC");

            dialog.commands.push(new UICommand("Run anyway", () => { window.open(this.state.app.startPage, "_blank") }))
            dialog.commands.push(new UICommand("Don't run"))
            dialog.showAsync();
            return;
        }

        this.updatePressState(e);
        // BUGBUG: Hack to prevent the tile from launching on mobile for now
        if (this.state.app.load && !isMobile()) {
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

            Events.getInstance()
                .dispatchEvent(event);

            setTimeout(() => this.setState({ visible: true }), 1000);
        }
    }

    render(props: TileProps, state: TileState) {
        let containerStyle: any = {
            'grid-row-start': props.row !== undefined ? (props.row + 1).toString() : undefined,
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

        let classList = ["tile-container", TileSize[props.size]];

        if (this.state.appStatus?.statusCode === 0) {
            classList.push("press-" + state.pressState);
        }
        else {
            classList.push("disabled");
        }

        if (!state.pack || !state.app) {
            return (
                <a id={`${props.packageName}!${props.appId}`}
                    class={classList.join(" ")}
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

        let visual = state.visualIdx == -1 ? TileDefaultVisual : state.visuals[state.visualIdx];
        let nextVisual = state.visuals[(state.visualIdx + 1) % state.visuals.length];
        let previousVisual = state.visuals[(state.visualIdx - 1) % state.visuals.length] ?? TileDefaultVisual;

        let frontBinding = visual?.bindings?.find(f => f.size === props.size);
        let nextBinding = nextVisual?.bindings?.find(f => f.size === props.size);

        let href = state.app.startPage;
        if (state.app.load) {
            href = `/app/${state.pack.identity.packageFamilyName}/${state.app.id}`;
        }

        let frontKey = state.visualIdx.toString();
        let nextKey = ((state.visualIdx + 1) % state.visuals.length).toString();


        //let size = this.getTileSize(props.size)
        return (
            <TileContext.Provider value={{ pack: state.pack, app: state.app, size: props.size }}>
                <a ref={this.root}
                    id={`${props.packageName}!${props.appId}`}
                    class={classList.join(" ")}
                    style={containerStyle}
                    onMouseDown={this.onMouseDown.bind(this)}
                    onMouseUp={this.onMouseUp.bind(this)}
                    onClick={this.onClick.bind(this)}
                    title={state.app.visualElements.displayName}
                    name={state.app.visualElements.displayName}
                    href={href}
                    target="_blank">
                    <div class="tile">
                        <div class="front" style={frontStyle} key={frontKey}>
                            <TileVisualRenderer app={state.app} binding={frontBinding} size={props.size} />
                        </div>
                        {state.swapping &&
                            <div class="next" key={nextKey} style={frontStyle} onAnimationEnd={this.onAnimationEnded.bind(this)}>
                                <TileVisualRenderer app={state.app} binding={nextBinding} size={props.size} />
                            </div>
                        }

                        {props.size !== TileSize.square70x70 &&
                            <TileBranding branding={visual.branding}
                                nextBranding={nextVisual?.branding}
                                previousBranding={previousVisual?.branding}
                                size={props.size}
                                visualElements={state.app.visualElements}/>}
                    </div>

                    <TileBadge isError={state.appStatus && state.appStatus.statusCode !== 0} />

                    <div className="tile-border"
                        style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
                </a>
            </TileContext.Provider>
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