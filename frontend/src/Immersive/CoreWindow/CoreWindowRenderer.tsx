import "./core-window.scss"

import { Component, ComponentChild, RefObject, RenderableProps, createRef } from "preact";

import CoreWindow from "~/Data/CoreWindow";
import CoreWindowAppHost from "./CoreWindowAppHost";
import CoreWindowDragContainer from "./CoreWindowDragContainer";
import CoreWindowErrorBoundary from "./CoreWindowErrorBoundary";
import CoreWindowEvent from "~/Events/CoreWindowEvent";
import CoreWindowManager from "~/Data/CoreWindowManager";
import CoreWindowSplashScreen from "./CoreWindowSplashScreen";
import CoreWindowStateEnum from "~/Data/CoreWindowState";
import CoreWindowTitleBar from "./CoreWindowTitleBar";
import Events from "~/Events";

interface CoreWindowRenderProps {
    id: string;
    isLaunching: boolean;

    x?: number;
    y?: number;
    width?: number;
    height?: number;
    visible?: boolean;
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
    ref: RefObject<CoreWindowDragContainer> = null;

    constructor(props: CoreWindowRenderProps) {
        super(props);
        this.state = { window: null, title: null };
        this.ref = createRef();
    }

    static getDerivedStateFromProps(props: CoreWindowRenderProps, state: CoreWindowRenderState): Partial<CoreWindowRenderState> {
        let info = CoreWindowManager.getWindowById(props.id);
        return { window: info, error: info.error };
    }

    componentDidMount() {
        this.setState({
            splashScreenVisible: this.state.window.state == CoreWindowStateEnum.loading,
            titleBarVisible: !CoreWindowManager.isStandalone()
        });

        Events.getInstance()
            .addEventListener("core-window-state-changed", this.onWindowStateChanged.bind(this));
    }

    componentWillUnmount() {
        Events.getInstance()
            .removeEventListener("core-window-state-changed", this.onWindowStateChanged.bind(this));
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

    onCloseClicked() {
        this.state.window.requestClose();
    }

    onMouseMoved(e: MouseEvent) {
        if (CoreWindowManager.isStandalone()) return;
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

    onWindowDragStart(e: PointerEvent) {
        const target = e.target as HTMLElement;
        target.setPointerCapture(e.pointerId);

        this.ref.current.startWindowDrag(this.state.window, e);
    }

    render(props?: RenderableProps<CoreWindowRenderProps, any>, state?: Readonly<CoreWindowRenderState>, context?: any): ComponentChild {
        let app = state.window.packageApplication;
        let visualElements = app.visualElements;
        let primaryColour = visualElements.backgroundColor;
        let iconUrl = visualElements.square30x30Logo;

        let style = {
            x: (props.x !== undefined ? props.x : state.window.position.x) + "px",
            y: (props.y !== undefined ? props.y : state.window.position.y) + "px",
            width: (props.width !== undefined ? props.width : state.window.size.width) + "px",
            height: (props.height !== undefined ? props.height : state.window.size.height) + "px",
        }

        if (props.visible !== undefined && !props.visible) {
            return <></>
        }

        return (
            <CoreWindowDragContainer ref={this.ref} onMouseMove={this.onMouseMoved.bind(this)} {...style}>
                <CoreWindowErrorBoundary error={this.state.error}>
                    <CoreWindowAppHost window={this.state.window} />
                </CoreWindowErrorBoundary>
                <CoreWindowSplashScreen elements={app.visualElements}
                    visible={this.state.splashScreenVisible} />
                {!CoreWindowManager.isStandalone() &&
                    <CoreWindowTitleBar window={this.state.window}
                        isVisible={this.state.titleBarVisible}
                        primaryColour={primaryColour}
                        iconUrl={iconUrl}
                        onCloseClicked={this.onCloseClicked.bind(this)}
                        onDragStart={this.onWindowDragStart.bind(this)} />
                }
            </CoreWindowDragContainer>
        );
    }
}