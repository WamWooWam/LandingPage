// singleton class to manage instances of apps

import { Package, PackageApplication } from "landing-page-shared";
import { Events, AppLaunchRequestedEvent } from "../Events";
import { CoreWindowInfo } from "./CoreWindowInfo";
import { CoreWindowManager } from "./CoreWindowManager";
import { newGuid } from "../Util";

export interface AppInstance {
    id: string;
    package: Package;
    packageApplication: PackageApplication;
    mainWindow: CoreWindowInfo;
    windows: CoreWindowInfo[];
}

export class AppInstanceManager {
    static instances: AppInstance[] = [];

    static launchInstance(pack: Package, packageApplication: PackageApplication): AppInstance {
        let instance: AppInstance = {
            id: newGuid(),
            package: pack,
            packageApplication: packageApplication,
            mainWindow: null,
            windows: []
        };

        instance.mainWindow = CoreWindowManager.createCoreWindowForApp(instance);
        instance.windows.push(instance.mainWindow);

        AppInstanceManager.instances.push(instance);
        return instance;
    }
}