import CoreApplicationManager from "./Data/CoreApplicationManager";
import CoreWindowLayoutManager from "./Data/CoreWindowLayoutManager";
import CoreWindowRenderer from "~/Immersive/CoreWindow/CoreWindowRenderer";
import MessageDialogRenderer from "~/Immersive/MessageDialog/MessageDialogRenderer";
import PackageRegistry from "./Data/PackageRegistry";
import ViewSizePreference from "./Data/ViewSizePreference";

interface StandaloneRootProps {
    appId: string;
    packageId: string;
}

// BUGBUG: this is currently optimised for a single window to reduce bundle size,
// but may we need to support multiple windows per app in future
// export default class StandaloneRoot extends Component<StandaloneRootProps, StandaloneRootState> {
export default function StandaloneRoot(props: StandaloneRootProps) {
    let pack = PackageRegistry.getPackage(props.packageId)!;
    let app = pack.applications!.get(props.appId);
    if (!app) {
        throw new Error(`Application ${props.appId} not found!`);
    }

    const instance = CoreApplicationManager.launchInstance(pack, app);
    CoreWindowLayoutManager.getInstance()
        .addWindowToLayout(instance.mainWindow, ViewSizePreference.default)

    // Events.getInstance()
    //     .addEventListener("layout-updated", () => {
    //         this.forceUpdate(); // slight hack to force a re-render
    //     });

    const id = instance.mainWindow.id;
    return (
        <>
            <div class="core-window-container">
                <CoreWindowRenderer id={id} isLaunching={false} visible={true} />
            </div>
            <MessageDialogRenderer />
        </>
    );
}
