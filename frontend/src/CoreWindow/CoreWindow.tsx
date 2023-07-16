import { Component, ComponentChild, RenderableProps } from "preact";
import { CoreWindowInfo } from "../Data/CoreWindowInfo";
import { CoreWindowManager } from "../Data/CoreWindowManager";
import { CoreWindowAppHost } from "./CoreWindowAppHost";
import { CoreWindowSplashScreen } from "./CoreWindowSplashScreen";
import { CoreWindowTitleBar } from "./CoreWindowTitleBar";

interface CoreWindowProps {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isLaunching: boolean;
};

interface CoreWindowState {
    info: CoreWindowInfo;
    title?: string;
    splashScreenVisible?: boolean;
    titleBarVisible?: boolean;
};

export class CoreWindow extends Component<CoreWindowProps, CoreWindowState> {
    constructor(props: CoreWindowProps) {
        super(props);
        this.state = { info: null };
    }

    static getDerivedStateFromProps(props: CoreWindowProps, state: CoreWindowState): CoreWindowState {
        return { info: CoreWindowManager.getWindowById(props.id) };
    }

    componentDidMount() {
        this.setState({
            title: this.state.info.packageApplication.visualElements.displayName,
            splashScreenVisible: true,
            titleBarVisible: true
        });
    }

    onLoaded() {
        this.setState({ splashScreenVisible: false, titleBarVisible: false });
    }

    render(props?: RenderableProps<CoreWindowProps, any>, state?: Readonly<CoreWindowState>, context?: any): ComponentChild {
        let app = state.info.packageApplication;
        let visualElements = app.visualElements;

        console.log(app);

        let primaryColour = visualElements.backgroundColor;
        let splashColour =
            visualElements.splashScreen.backgroundColor
                && visualElements.splashScreen.backgroundColor != '' ?
                visualElements.splashScreen.backgroundColor :
                primaryColour;
        let iconUrl = visualElements.square30x30Logo;
        let splashUrl = visualElements.splashScreen.image;

        let style = {
            left: props.x + "px",
            top: props.y + "px",
            width: props.width + "px",
            height: props.height + "px",
        }

        return (
            <div class="core-window" style={style}>
                <CoreWindowAppHost instance={this.state.info.instance}
                    window={this.state.info}
                    onLoaded={this.onLoaded.bind(this)} />
                <CoreWindowSplashScreen backgroundColour={splashColour}
                    splashImageUrl={splashUrl}
                    visible={this.state.splashScreenVisible} />
                <CoreWindowTitleBar title={this.state.title}
                    isVisible={this.state.titleBarVisible}
                    primaryColour={primaryColour}
                    iconUrl={iconUrl} />
            </div>
        );
    }
}