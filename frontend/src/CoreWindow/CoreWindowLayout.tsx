import { Component } from "preact";
import Events from "../Events";
import CoreWindow from "../Data/CoreWindow";
import CoreWindowRenderer from "./CoreWindowRenderer";
import CoreWindowLayoutManager from "../Data/CoreWindowLayoutManager";
import CoreWindowLayoutParams from "../Data/CoreWindowLayoutParams";
import { CoreWindowLayoutSeparator } from "./CoreWindowLayoutSeparator";

interface CoreWindowLayoutProps {
}

enum CoreWindowLayoutMode {
    FullScreen,
    SplitScreen,
};

interface CoreWindowLayoutState {
    windows: CoreWindow[];
}

export default class CoreWindowLayout extends Component<CoreWindowLayoutProps, CoreWindowLayoutState> {
    constructor(props: CoreWindowLayoutProps) {
        super(props);
        this.state = { windows: [] };
    }

    componentDidMount(): void {
        Events.getInstance().addEventListener("layout-updated", this.onLayoutUpdated.bind(this));
        Events.getInstance().addEventListener("core-window-visibility-changed", this.onLayoutUpdated.bind(this));
    }

    componentWillUnmount(): void {
        Events.getInstance().removeEventListener("layout-updated", this.onLayoutUpdated.bind(this));
        Events.getInstance().removeEventListener("core-window-visibility-changed", this.onLayoutUpdated.bind(this));
    }

    onLayoutUpdated(): void {
        const manager = CoreWindowLayoutManager.getInstance()
        const windows = manager.getVisibleWindows();
        this.setState({ windows });
        this.forceUpdate();
    }

    render() {

        // render corewindows + a separator inbetween each if there are more than one
        return (
            <div class="core-window-layout">
                {this.state.windows.map((l, i) => {
                    return (
                        <>
                            {l?.visible && <CoreWindowRenderer key={l.id} id={l.id} isLaunching={false} />}
                            {
                                i < this.state.windows.length - 1 &&
                                <CoreWindowLayoutSeparator
                                    x={l.position.x + l.size.width}
                                    y={l.position.y}
                                    height={l.size.height}
                                    left={this.state.windows[i]}
                                    right={this.state.windows[i + 1]} />
                            }
                        </>
                    )
                })}
            </div>
        );
    }
}