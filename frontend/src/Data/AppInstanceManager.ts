// singleton class to manage instances of apps

import AppInstance from './AppInstance';
import CoreWindowManager from './CoreWindowManager';
import { Package } from 'shared/Package';
import { PackageApplication } from 'shared/PackageApplication';

export default class AppInstanceManager {
    static instances: AppInstance[] = [];

    static launchInstance(
        pack: Package,
        packageApplication: PackageApplication,
    ): AppInstance {
        for (let i = 0; i < AppInstanceManager.instances.length; i++) {
            let instance = AppInstanceManager.instances[i];
            if (
                instance.package.identity.packageFamilyName ===
                    pack.identity.packageFamilyName &&
                instance.packageApplication.id === packageApplication.id
            ) {
                return instance;
            }
        }

        let instance = new AppInstance(pack, packageApplication);
        let mainWindow = CoreWindowManager.createCoreWindowForApp(instance);
        instance.windows.push(mainWindow);

        AppInstanceManager.instances.push(instance);
        return instance;
    }

    static terminateInstance(instance: AppInstance): void {
        let index = AppInstanceManager.instances.indexOf(instance);
        if (index > -1) {
            let windows = instance.windows.slice();
            for (let i = 0; i < windows.length; i++) {
                let window = windows[i];
                CoreWindowManager.deleteWindowById(window.id);
            }

            AppInstanceManager.instances.splice(index, 1);
        }
    }
}
