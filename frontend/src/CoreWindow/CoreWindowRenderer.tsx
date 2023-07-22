import { Component, ComponentChild, RenderableProps } from "preact";
import CoreWindow from "../Data/CoreWindow";
import CoreWindowManager from "../Data/CoreWindowManager";
import CoreWindowAppHost from "./CoreWindowAppHost";
import CoreWindowSplashScreen from "./CoreWindowSplashScreen";
import CoreWindowTitleBar from "./CoreWindowTitleBar";
import CoreWindowErrorBoundary from "./CoreWindowErrorBoundary";
import Events from "../Events";
import CoreWindowEvent from "../Events/CoreWindowEvent";
import CoreWindowStateEnum from "../Data/CoreWindowState";

interface CoreWindowRenderProps {
    id: string;
    isLaunching: boolean;

    x?: number;
    y?: number;
    width?: number;
    height?: number;
};

interface CoreWindowRenderState {
    window: CoreWindow;
    error?: Error;
    splashScreenVisible?: boolean;
    title: string;
    titleBarVisible?: boolean;
    titleBarTimeout?: number;
};

export default class CoreWindowRenderer extends Component<CoreWindowRenderProps, CoreWindowRenderState> {
    constructor(props: CoreWindowRenderProps) {
        super(props);
        this.state = { window: null, title: null };
    }

    static getDerivedStateFromProps(props: CoreWindowRenderProps, state: CoreWindowRenderState): Partial<CoreWindowRenderState> {
        let info = CoreWindowManager.getWindowById(props.id);
        return { window: info, error: info.error, title: info.title };
    }

    componentDidMount() {
        this.setState({
            splashScreenVisible: this.state.window.state == CoreWindowStateEnum.loading,
            titleBarVisible: true
        });

        Events.getInstance()
            .addEventListener("core-window-state-changed", this.onWindowStateChanged.bind(this));
        Events.getInstance()
            .addEventListener("core-window-title-changed", this.onWindowTitleChanged.bind(this));
    }

    componentWillUnmount() {
        Events.getInstance()
            .removeEventListener("core-window-state-changed", this.onWindowStateChanged.bind(this));
        Events.getInstance()
            .removeEventListener("core-window-title-changed", this.onWindowTitleChanged.bind(this));
    }

    onWindowStateChanged(e: CoreWindowEvent) {
        if (e.detail.id == this.state.window.id) {
            this.setState({
                splashScreenVisible: e.detail.state == CoreWindowStateEnum.loading,
                error: e.detail.error
            });

            if (e.detail.state >= CoreWindowStateEnum.loaded) {
                if (this.state.titleBarTimeout) {
                    clearTimeout(this.state.titleBarTimeout);
                }

                this.setState((state) => ({
                    titleBarTimeout: setTimeout(() => {
                        this.setState({ titleBarVisible: false });
                    }, 2000) as any
                }));
            }
        }
    }

    onWindowTitleChanged(e: CoreWindowEvent) {
        if (e.detail.id == this.state.window.id) {
            this.setState({ title: e.detail.title });
        }
    }

    onCloseClicked() {
        this.state.window.close();
    }

    onMouseMoved(e: MouseEvent) {
        let x = e.pageX;
        let y = e.pageY;

        // console.log(y);

        if (this.state.titleBarVisible) {
            if (y > 30) {
                this.setState({ titleBarVisible: false });
            }
        }
        else {
            if (y <= 5) {
                if (this.state.titleBarTimeout) {
                    clearTimeout(this.state.titleBarTimeout);
                }
                this.setState({ titleBarVisible: true });
            }
        }
    }

    render(props?: RenderableProps<CoreWindowRenderProps, any>, state?: Readonly<CoreWindowRenderState>, context?: any): ComponentChild {
        let app = state.window.packageApplication;
        let visualElements = app.visualElements;
        let primaryColour = visualElements.backgroundColor;
        let splashColour =
            visualElements.splashScreen.backgroundColor
                && visualElements.splashScreen.backgroundColor != '' ?
                visualElements.splashScreen.backgroundColor :
                primaryColour;
        let iconUrl = visualElements.square30x30Logo;
        let splashUrl = visualElements.splashScreen.image;

        let style = {
            left: (props.x !== undefined ? props.x : state.window.position.x) + "px",
            top: (props.y !== undefined ? props.y : state.window.position.y) + "px",
            width: (props.width !== undefined ? props.width : state.window.size.width) + "px",
            height: (props.height !== undefined ? props.height : state.window.size.height) + "px",
        }

        return (
            <div class="core-window" style={style} onMouseMove={this.onMouseMoved.bind(this)}>
                <CoreWindowErrorBoundary error={this.state.error}>
                    <CoreWindowAppHost window={this.state.window} />
                </CoreWindowErrorBoundary>
                <CoreWindowSplashScreen backgroundColour={splashColour}
                    splashImageUrl={splashUrl}
                    visible={this.state.splashScreenVisible} />
                <CoreWindowTitleBar title={this.state.title}
                    displayName={app.visualElements.displayName}
                    isVisible={this.state.titleBarVisible}
                    primaryColour={primaryColour}
                    iconUrl={iconUrl}
                    closeClicked={this.onCloseClicked.bind(this)} />
            </div>
        );
    }
}