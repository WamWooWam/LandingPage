import PackageRegistry from "./Data/PackageRegistry";
import Events from "./Events";
import AppLaunchRequestedEvent from "./Events/AppLaunchRequestedEvent";

class Launcher {
    static launchApp(id: string): void {
        const parts = id.split("!");
        const packageId = parts[0];
        const appId = parts[1];

        let pack = PackageRegistry.getPackage(packageId);
        if (!pack) {
            throw new Error(`Package ${packageId} not found!`);
        }

        let app = pack.applications[appId];
        if (!app) {
            throw new Error(`Application ${appId} not found!`);
        }

        Events.getInstance().dispatchEvent(new AppLaunchRequestedEvent(pack, app));
    }
}

(<any>window).Launcher = Launcher;