import { Component } from "preact";
import { CoreWindowInfo } from "../Data/CoreWindowInfo";
import { CoreWindow } from "./CoreWindow";

interface CoreWindowLayoutProps {
    windows: CoreWindowInfo[];
}

enum CoreWindowLayoutMode {
    FullScreen,
    SplitScreen,
};

interface CoreWindowLayoutState {
    mode: CoreWindowLayoutMode;
    dividerPosition: number;
}

// lays out windows, handles window resizing, etc.
// there are at most 2 windows visible at a time in split screen, or one window in full screen
export class CoreWindowLayout extends Component<CoreWindowLayoutProps, CoreWindowLayoutState> {
    constructor(props: CoreWindowLayoutProps) {
        super(props);
        this.state = { mode: CoreWindowLayoutMode.FullScreen, dividerPosition: -1 };
    }

    render() {
        // only handle full screen for now

        let windows = this.props.windows;
        let coreWindow = windows[0];

        if (!window) return (<div class="core-window-layout"></div>);

        let containerSize = { width: window.innerWidth, height: window.innerHeight };

        return (
            <div class="core-window-layout">
                <CoreWindow id={coreWindow.id}
                    x={0}
                    y={0}
                    width={containerSize.width}
                    height={containerSize.height}
                    isLaunching={false} />
            </div>
        );
    }
}