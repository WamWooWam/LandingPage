import { Component } from "preact";
import { AppLaunchRequestedEvent, Events } from "../Events";
import { AppInstance, AppInstanceManager } from "../Data/AppInstanceManager";
import { CoreWindowLayout } from "./CoreWindowLayout";
import { CoreWindowLaunchAnimation } from "./Animations/CoreWindowLaunchAnimation";
import { CoreWindow } from "./CoreWindow";
import { CoreWindowInfo } from "../Data/CoreWindowInfo";
import { TileInfo } from "../Data/TileInfo";
import { Position, Size } from "../Util";
import "./core-window.css"


interface LaunchParams {
    instance: AppInstance,
    window: CoreWindowInfo,
    tile: TileInfo,

    position: Position,
    size: Size,
    targetPosition: Position,
    targetSize: Size,
}

interface CoreWindowContainerProps {

}

interface CoreWindowContainerState {
    launchParams: LaunchParams;
    instance: AppInstance;
}

export class CoreWindowContainer extends Component<CoreWindowContainerProps, CoreWindowContainerState> {
    constructor(props: CoreWindowContainerProps) {
        super(props);
        this.state = { launchParams: null, instance: null };
    }

    componentDidMount(): void {
        Events.getInstance().addEventListener("app-launch-requested", this.onAppLaunchRequested.bind(this));
    }

    componentWillUnmount(): void {
        Events.getInstance().removeEventListener("app-launch-requested", this.onAppLaunchRequested.bind(this));
    }

    onAppLaunchRequested(e: AppLaunchRequestedEvent) {
        const instance = AppInstanceManager.launchInstance(e.package, e.packageApplication);
        console.log(instance);

        const launchParams = {
            instance: instance,
            window: instance.mainWindow,
            tile: {
                app: instance.packageApplication,
                pack: instance.package,
                size: e.params.tileSize,
                visual: e.params.tileVisual,
            },
            position: {
                x: e.params.tileX,
                y: e.params.tileY
            },
            size: {
                width: e.params.tileWidth,
                height: e.params.tileHeight
            },
            targetPosition: {
                x: (window.innerWidth / 2),
                y: window.innerHeight / 2
            },
            targetSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };

        console.log(launchParams);

        this.setState({
            launchParams: launchParams
        });
    }

    onAnimationComplete() {
        this.setState((state) => ({ launchParams: null, instance: state.launchParams.instance }));
    }

    render() {
        return (
            <div className="core-window-container">
                {this.state.instance && <CoreWindowLayout windows={[this.state.instance?.mainWindow]} />}

                {this.state.launchParams &&
                    <CoreWindowLaunchAnimation windowId={this.state.launchParams?.window.id}
                        tile={this.state.launchParams?.tile} visible={true}
                        initialPosition={this.state.launchParams.position}
                        initialSize={this.state.launchParams.size}
                        targetPosition={this.state.launchParams.targetPosition}
                        targetSize={this.state.launchParams.targetSize}
                        onAnimationComplete={this.onAnimationComplete.bind(this)} />
                }
            </div>
        );
    }
}