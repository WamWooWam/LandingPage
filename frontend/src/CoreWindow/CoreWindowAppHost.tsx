import { Component } from "preact";
import AppInstance from "../Data/AppInstance";
import CoreWindow from "../Data/CoreWindow";
import CoreWindowManager from "../Data/CoreWindowManager";
import CoreWindowState from "../Data/CoreWindowState";

interface CoreWindowAppHostProps {
    window: CoreWindow;
}

export default class CoreWindowAppHost extends Component<CoreWindowAppHostProps, {}> {
    shouldComponentUpdate(): boolean {
        return false;
    }

    async componentDidMount(): Promise<void> {
        this.base.appendChild(this.props.window.view);
        await this.props.window.load();
    }

    componentWillUnmount(): void {
        try {
            this.base.removeChild(this.props.window.view);
        } catch (e) {
            this.props.window.view.remove();
        }
    }

    render() {
        return (<div className="core-window-app-host"></div>);
    }
}