import { Component, RefObject, createRef } from "preact";
import Events from "../Events";
import AppLaunchRequestedEvent from "../Events/AppLaunchRequestedEvent";
import AppInstanceManager from "../Data/AppInstanceManager";
import CoreWindowLayout from "./CoreWindowLayout";
import CoreWindowLaunchAnimationFromTile from "./Animations/CoreWindowLaunchAnimationFromTile";
import CoreWindowLaunchAnimation from "./Animations/CoreWindowLaunchAnimation";
import CoreWindowLaunchParams from "../Data/CoreWindowLaunchParams";
import CoreWindowLayoutManager from "../Data/CoreWindowLayoutManager";
import CoreWindowEvent from "../Events/CoreWindowEvent";
import CoreWindowCloseAnimation from "./Animations/CoreWindowCloseAnimation";
import ViewSizePreference from "../Data/ViewSizePreference";

import "./core-window.scss"
import { Launcher } from "../Test";

interface CoreWindowAnimation {
    params: CoreWindowLaunchParams;
    onAnimationComplete: () => void;
}

const CoreWindowLaunchAnimationContainer = (props: CoreWindowAnimation) => {
    if (!props.params) return null;

    if (props.params.origin?.tile) {
        return (
            <CoreWindowLaunchAnimationFromTile
                windowId={props.params.window.id}
                tile={props.params.origin.tile} visible={true}
                initialPosition={props.params.origin.position}
                initialSize={props.params.origin.size}
                targetPosition={props.params.targetPosition}
                targetSize={props.params.targetSize}
                onAnimationComplete={props.onAnimationComplete} />
        )
    }
    else {
        return (
            <CoreWindowLaunchAnimation
                windowId={props.params.window.id} visible={true}
                targetPosition={props.params.targetPosition}
                targetSize={props.params.targetSize}
                onAnimationComplete={props.onAnimationComplete} />
        )
    }
}


interface CoreWindowContainerProps {

}

interface CoreWindowContainerState {
    launchParams: CoreWindowAnimation[];
    closeParams: CoreWindowAnimation[];
}

export default class CoreWindowContainer extends Component<CoreWindowContainerProps, CoreWindowContainerState> {
    constructor(props: CoreWindowContainerProps) {
        super(props);
        this.state = { launchParams: [], closeParams: [] };
    }

    componentDidMount(): void {
        Events.getInstance().addEventListener("app-launch-requested", this.onAppLaunchRequested.bind(this));
        Events.getInstance().addEventListener("core-window-close-requested", this.onWindowCloseRequested.bind(this));

        let location = new URL(window.location.href);
        let app = location.searchParams.get("app");
        if (app) {
            Launcher.launchApp(app);
        }
    }

    componentWillUnmount(): void {
        Events.getInstance().removeEventListener("app-launch-requested", this.onAppLaunchRequested.bind(this));
        Events.getInstance().removeEventListener("core-window-close-requested", this.onWindowCloseRequested.bind(this));
    }

    onAppLaunchRequested(e: AppLaunchRequestedEvent) {
        const instance = AppInstanceManager.launchInstance(e.package, e.packageApplication);
        console.log(instance);

        if (!CoreWindowLayoutManager.getInstance()
            .addWindowToLayout(instance.mainWindow, ViewSizePreference.useHalf))
            return;

        if (e.params?.noAnimation) {
            instance.mainWindow.visible = true;
            instance.mainWindow.focus();
            return;
        }

        let launchParams: CoreWindowLaunchParams = {
            window: instance.mainWindow,
            targetPosition: instance.mainWindow.position,
            targetSize: instance.mainWindow.size
        } as CoreWindowLaunchParams;

        if (e.params) {
            Object.assign(launchParams, {
                origin: {
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
                    }
                }
            });
        }

        console.log(launchParams);

        const animation = {
            params: launchParams,
            onAnimationComplete: () => {
                launchParams.window.visible = true;
                launchParams.window.focus();

                if (e.params?.tileVisual) {
                    // reset the tile
                }

                this.setState((state) => ({
                    launchParams: state.launchParams.filter((p) => p !== animation)
                }));
            }
        } as CoreWindowAnimation;

        this.setState((state) => ({ launchParams: [animation, ...state.launchParams] }));
    }

    onWindowCloseRequested(e: CoreWindowEvent) {
        const animation = {
            params: {
                window: e.detail,
                targetPosition: e.detail.position,
                targetSize: e.detail.size
            } as CoreWindowLaunchParams,
            onAnimationComplete: () => {
                e.detail.visible = false;
                this.setState((state) => ({
                    closeParams: state.closeParams.filter((p) => p !== animation)
                }));
            }
        } as CoreWindowAnimation;

        this.setState((state) => ({
            closeParams: [...state.closeParams, animation]
        }));
    };

    onWindowClosed(e: CoreWindowEvent) {
        // CoreWindowLayoutManager.getInstance().removeWindowFromLayout(e.detail);
    }

    render() {
        return (
            <div className="core-window-container">
                <CoreWindowLayout />

                {this.state.launchParams?.map((animation) => (
                    <CoreWindowLaunchAnimationContainer
                        params={animation.params}
                        onAnimationComplete={animation.onAnimationComplete} />
                ))}
                {this.state.closeParams?.map((animation) => (
                    <CoreWindowCloseAnimation
                        initialPosition={animation.params.window.position}
                        initialSize={animation.params.window.size}
                        windowId={animation.params.window.id}
                        visible={true}
                        onAnimationComplete={animation.onAnimationComplete} />
                ))}
            </div>
        );
    }
}