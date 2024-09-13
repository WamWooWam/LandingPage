import "./core-window.scss"

import { Component, RefObject, createRef } from "preact";

import AppInstanceManager from "~/Data/AppInstanceManager";
import AppLaunchRequestedEvent from "~/Events/AppLaunchRequestedEvent";
import CoreWindowCloseAnimation from "./Animations/CoreWindowCloseAnimation";
import CoreWindowEvent from "~/Events/CoreWindowEvent";
import CoreWindowLaunchAnimationContainer from "./CoreWindowLaunchAnimationContainer";
import CoreWindowLaunchParams from "~/Data/CoreWindowLaunchParams";
import CoreWindowLayout from "./CoreWindowLayout";
import CoreWindowLayoutManager from "~/Data/CoreWindowLayoutManager";
import Events from "~/Events";
import ViewSizePreference from "~/Data/ViewSizePreference";

export interface CoreWindowAnimation {
    params: CoreWindowLaunchParams;
    onAnimationComplete: () => void;
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

        this.onAppLaunchRequested = this.onAppLaunchRequested.bind(this);
        this.onWindowCloseRequested = this.onWindowCloseRequested.bind(this);
    }

    componentDidMount(): void {
        Events.getInstance().addEventListener("app-launch-requested", this.onAppLaunchRequested);
        Events.getInstance().addEventListener("core-window-close-requested", this.onWindowCloseRequested);
    }

    componentWillUnmount(): void {
        Events.getInstance().removeEventListener("app-launch-requested", this.onAppLaunchRequested);
        Events.getInstance().removeEventListener("core-window-close-requested", this.onWindowCloseRequested);
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

        Events.getInstance()
            .dispatchEvent(new CustomEvent("app-launch", { detail: launchParams }));
    }

    onWindowCloseRequested(e: CoreWindowEvent) {
        const animation = {
            params: {
                window: e.detail,
                targetPosition: e.detail.position,
                targetSize: e.detail.size
            } as CoreWindowLaunchParams,
            onAnimationComplete: () => this.onWindowCloseAnimationComplete(e, animation)
        } as CoreWindowAnimation;

        this.setState((state) => ({
            closeParams: [...state.closeParams, animation]
        }));
    };

    onWindowCloseAnimationComplete(e: CoreWindowEvent, animation: CoreWindowAnimation) {
        e.detail.visible = false;
        this.setState((state) => ({
            closeParams: state.closeParams.filter((p) => p !== animation)
        }));

        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-closed", e.detail));
    }

    onWindowClosed(e: CoreWindowEvent) {
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