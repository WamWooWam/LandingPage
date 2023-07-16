import { Component } from "preact";
import { AppInstance, AppInstanceManager } from "../Data/AppInstanceManager";
import { CoreWindowInfo } from "../Data/CoreWindowInfo";

interface CoreWindowAppHostProps {
    instance: AppInstance;
    window: CoreWindowInfo;
    onLoaded: () => void;
}

interface CoreWindowAppHostState {

};

export class CoreWindowAppHost extends Component<CoreWindowAppHostProps, CoreWindowAppHostState> {
    shouldComponentUpdate(): boolean {
        return false;
    }

    async componentDidMount(): Promise<void> {
        this.base.appendChild(this.props.window.view);

        if (!this.props.window.view.querySelector(`#${this.props.window.id}`)) {
            let app = this.props.instance.packageApplication;
            let instance = await app.load();
            instance.default(this.props.window.view);
            this.props.onLoaded();
        }
    }

    componentWillUnmount(): void {
        this.base.removeChild(this.props.window.view);
    }

    render() {
        return (<div className="core-window-app-host"></div>);
    }
}