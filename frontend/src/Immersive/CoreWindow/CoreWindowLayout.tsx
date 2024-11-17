import CoreWindowLayoutManager, {
    CoreWindowLayoutKind,
} from '~/Data/CoreWindowLayoutManager';

import { Component } from 'preact';
import CoreWindow from '~/Data/CoreWindow';
import CoreWindowLayoutSeparator from './CoreWindowLayoutSeparator';
import CoreWindowRenderer from './CoreWindowRenderer';
import Events from '~/Events';

interface CoreWindowLayoutProps {}

interface CoreWindowLayoutState {
    windows: CoreWindow[];
    rawWindows: CoreWindow[];
    layout: CoreWindowLayoutKind;
}

export default class CoreWindowLayout extends Component<
    CoreWindowLayoutProps,
    CoreWindowLayoutState
> {
    constructor(props: CoreWindowLayoutProps) {
        super(props);
        this.state = {
            windows: [],
            rawWindows: [],
            layout: CoreWindowLayoutKind.fullScreen,
        };

        this.onLayoutUpdated = this.onLayoutUpdated.bind(this);
    }

    componentDidMount(): void {
        Events.getInstance().addEventListener(
            'layout-updated',
            this.onLayoutUpdated,
        );
        Events.getInstance().addEventListener(
            'core-window-visibility-changed',
            this.onLayoutUpdated,
        );
    }

    componentWillUnmount(): void {
        Events.getInstance().removeEventListener(
            'layout-updated',
            this.onLayoutUpdated,
        );
        Events.getInstance().removeEventListener(
            'core-window-visibility-changed',
            this.onLayoutUpdated,
        );
    }

    onLayoutUpdated(): void {
        const manager = CoreWindowLayoutManager.getInstance();
        const layout = manager.getLayoutInfo();
        const windows = [...layout.windows.filter((w) => w)];
        if (windows.length === 0) {
            Events.getInstance().dispatchEvent(
                new CustomEvent('start-show-requested'),
            );
        }

        this.setState({
            windows,
            rawWindows: layout.windows,
            layout: layout.state,
        });
    }

    onBackdropClicked() {
        Events.getInstance().dispatchEvent(
            new CustomEvent('start-show-requested'),
        );
    }

    render() {
        const separatorX =
            this.state.rawWindows[0]?.right ??
            this.state.rawWindows[1]?.left - 22 ??
            (window.innerHeight - 22) / 2;
        const separatorY = 0;
        // render corewindows + a separator inbetween each if there are more than one
        return (
            <div
                class="core-window-layout"
                onClick={this.onBackdropClicked.bind(this)}>
                {this.state.windows.map((l, i) => (
                    <CoreWindowRenderer
                        key={l.id}
                        id={l.id}
                        isLaunching={false}
                        visible={l.visible}
                    />
                ))}
                {this.state.layout === CoreWindowLayoutKind.split && (
                    <CoreWindowLayoutSeparator x={separatorX} y={separatorY} />
                )}
            </div>
        );
    }
}
