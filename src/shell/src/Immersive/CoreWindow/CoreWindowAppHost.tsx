import { Component, Ref, RefObject, createRef } from "preact";

import CoreWindow from "~/Data/CoreWindow";

interface CoreWindowAppHostProps {
    window: CoreWindow;
}

export default class CoreWindowAppHost extends Component<CoreWindowAppHostProps, {}> {
    hostRef: RefObject<HTMLDivElement>;

    constructor(props: CoreWindowAppHostProps) {
        super(props);
        this.hostRef = createRef<HTMLDivElement>();
    }

    shouldComponentUpdate(): boolean {
        return false;
    }

    async componentDidMount(): Promise<void> {
        this.hostRef.current.appendChild(this.props.window.view);
        await this.props.window.load();
    }

    componentWillUnmount(): void {
        try {
            this.hostRef.current.removeChild(this.props.window.view);
        } catch (e) {
            this.props.window.view.remove();
        }
    }

    render() {
        return (<div ref={this.hostRef} className="core-window-app-host"></div>);
    }
}