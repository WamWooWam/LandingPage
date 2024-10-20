// singleton class to manage instances of apps

import CoreApplication from "./CoreApplication";
import CoreWindowManager from "./CoreWindowManager";
import { Package } from "shared/Package";
import { PackageApplication } from "shared/PackageApplication";

export default class CoreApplicationManager {
    static instances: CoreApplication[] = [];

    static launchInstance(pack: Package, packageApplication: PackageApplication): CoreApplication {
        for (let i = 0; i < CoreApplicationManager.instances.length; i++) {
            let instance = CoreApplicationManager.instances[i];
            if (instance.package.identity.packageFamilyName === pack.identity.packageFamilyName && instance.packageApplication.id === packageApplication.id) {
                return instance;
            }
        }

        let instance = new CoreApplication(pack, packageApplication);
        let mainWindow = CoreWindowManager.createCoreWindowForApp(instance);
        instance.windows.push(mainWindow);

        CoreApplicationManager.instances.push(instance);
        return instance;
    }

    static terminateInstance(instance: CoreApplication): void {
        let index = CoreApplicationManager.instances.indexOf(instance);
        if (index > -1) {
            let windows = instance.windows.slice();
            for (let i = 0; i < windows.length; i++) {
                let window = windows[i];
                CoreWindowManager.deleteWindowById(window.id);
            }

            CoreApplicationManager.instances.splice(index, 1);
        }
    }
}