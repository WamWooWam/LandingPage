import AppInstanceManager from "./Data/AppInstanceManager";
import { Component } from "preact";
import CoreWindowLayoutManager from "./Data/CoreWindowLayoutManager";
import CoreWindowRenderer from "~/Immersive/CoreWindow/CoreWindowRenderer";
import PackageRegistry from "./Data/PackageRegistry";
import ViewSizePreference from "./Data/ViewSizePreference";
import MessageDialogRenderer from "~/Immersive/MessageDialog/MessageDialogRenderer";

interface StandaloneRootProps {
    appId: string;
    packageId: string;
}

interface StandaloneRootState {
    id: string;
}

// BUGBUG: this is currently optimised for a single window to reduce bundle size,
// but may we need to support multiple windows per app in future
export default class StandaloneRoot extends Component<StandaloneRootProps, StandaloneRootState> {
    componentWillMount() {
        let pack = PackageRegistry.getPackage(this.props.packageId);
        let app = pack.applications[this.props.appId];
        if (!app) {
            throw new Error(`Application ${this.props.appId} not found!`);
        }

        const instance = AppInstanceManager.launchInstance(pack, app);
        CoreWindowLayoutManager.getInstance()
            .addWindowToLayout(instance.mainWindow, ViewSizePreference.default)

        this.setState({ id: instance.mainWindow.id });
    }

    render() {
        return (
            <>
                <div class="core-window-container">
                    <CoreWindowRenderer id={this.state.id} isLaunching={false} visible={true} />
                </div>
                <MessageDialogRenderer />
            </>
        );
    }
}
