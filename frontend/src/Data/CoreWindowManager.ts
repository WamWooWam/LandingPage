
//
// Because React is kinda difficult to work with for this stuff, creating a CoreWindow allocates
// a "handle" associated with the window state and <webview> element that can be used to render 
// that window anywhere in the DOM
//

import Events from "../Events";
import AppInstance from "./AppInstance";
import CoreWindowEvent from "../Events/CoreWindowEvent";
import CoreWindow from "./CoreWindow";
import AppInstanceManager from "./AppInstanceManager";
import CoreWindowLayoutManager from "./CoreWindowLayoutManager";

export default class CoreWindowManager {
    static coreWindowMap: Map<string, CoreWindow> = new Map();

    static createCoreWindowForApp(instance: AppInstance): CoreWindow {
        let info = new CoreWindow(instance);
        console.log(info.id, info);
        CoreWindowManager.coreWindowMap.set(info.id, info);

        Events.getInstance().dispatchEvent(new CoreWindowEvent("core-window-created", info));

        return info;
    }

    static getWindowById(id: string): CoreWindow {
        return CoreWindowManager.coreWindowMap.get(id);
    }

    static deleteWindowById(id: string): void {
        let window = CoreWindowManager.coreWindowMap.get(id);
        if (!window) return;

        CoreWindowLayoutManager.getInstance()
            .removeWindow(id);

        Events.getInstance()
            .dispatchEvent(new CoreWindowEvent("core-window-destroyed", window));

        if (window) {
            let instance = window.instance;
            let index = instance.windows.indexOf(window);
            if (index > -1) {
                instance.windows.splice(index, 1);
            }

            if (window === instance.mainWindow) {
                AppInstanceManager.terminateInstance(instance);
            }

            CoreWindowManager.coreWindowMap.delete(id);
        }
    }
}