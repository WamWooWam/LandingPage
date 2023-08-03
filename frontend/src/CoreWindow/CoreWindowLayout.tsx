import { Component } from "preact";
import Events from "../Events";
import CoreWindow from "../Data/CoreWindow";
import CoreWindowRenderer from "./CoreWindowRenderer";
import CoreWindowLayoutManager, { CoreWindowLayoutKind } from "../Data/CoreWindowLayoutManager";
import CoreWindowLayoutParams from "../Data/CoreWindowLayoutParams";
import { CoreWindowLayoutSeparator } from "./CoreWindowLayoutSeparator";

interface CoreWindowLayoutProps {
}

interface CoreWindowLayoutState {
    windows: CoreWindow[];
    rawWindows: CoreWindow[];
    layout: CoreWindowLayoutKind
}

export default class CoreWindowLayout extends Component<CoreWindowLayoutProps, CoreWindowLayoutState> {
    constructor(props: CoreWindowLayoutProps) {
        super(props);
        this.state = { windows: [], rawWindows: [], layout: CoreWindowLayoutKind.fullScreen };
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
        const state = manager.getLayoutInfo();

        this.setState({ windows: [...state.windows.filter(w => w)], rawWindows: state.windows, layout: state.state });
    }

    render() {
        const separatorX = this.state.rawWindows[0]?.right ?? (this.state.rawWindows[1]?.left - 22) ?? ((window.innerHeight - 22) / 2);
        const separatorY = 0;
        const separatorHeight = window.innerHeight;

        // render corewindows + a separator inbetween each if there are more than one
        return (
            <div class="core-window-layout">
                {this.state.windows.map((l, i) => <CoreWindowRenderer key={l.id} id={l.id} isLaunching={false} visible={l.visible} />)}
                {this.state.layout === CoreWindowLayoutKind.split &&
                    <CoreWindowLayoutSeparator x={separatorX} y={separatorY} height={separatorHeight} />}
            </div>
        );
    }
}