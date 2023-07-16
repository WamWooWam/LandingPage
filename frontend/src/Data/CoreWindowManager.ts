
//
// Because React is kinda difficult to work with for this stuff, creating a CoreWindow allocates
// a "handle" associated with the window state and <webview> element that can be used to render 
// that window anywhere in the DOM
//

import { newGuid } from "../Util";
import { AppInstance } from "./AppInstanceManager";
import { CoreWindowInfo } from "./CoreWindowInfo";
import { Package, PackageApplication } from "landing-page-shared";

export class CoreWindowManager {
    static coreWindowMap: Map<string, CoreWindowInfo> = new Map();

    static createCoreWindowForApp(instance: AppInstance): CoreWindowInfo {
        let id = `${instance.package.identity.packageFamilyName}_${instance.packageApplication.id}_${newGuid()}`;
        let view = document.createElement("div");
        view.id = id;

        let info: CoreWindowInfo = { id, package: instance.package, packageApplication: instance.packageApplication, instance, view };
        console.log(id);

        CoreWindowManager.coreWindowMap.set(id, info);

        return info;
    }

    static getWindowById(id: string): CoreWindowInfo {
        return CoreWindowManager.coreWindowMap.get(id);
    }
}