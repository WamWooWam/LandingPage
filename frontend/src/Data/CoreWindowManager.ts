//
// Because React is kinda difficult to work with for this stuff, creating a CoreWindow allocates
// a "handle" associated with the window state and <webview> element that can be used to render
// that window anywhere in the DOM
//

import AppInstance from './AppInstance';
import AppInstanceManager from './AppInstanceManager';
import CoreWindow from './CoreWindow';
import CoreWindowEvent from '../Events/CoreWindowEvent';
import CoreWindowLayoutManager from './CoreWindowLayoutManager';
import Events from '../Events';

export default class CoreWindowManager {
    static coreWindowMap: Map<string, CoreWindow> = new Map();

    static isStandalone(): boolean {
        return !!window?.location.pathname.match(/\/app\//);
    }

    static createCoreWindowForApp(instance: AppInstance): CoreWindow {
        let info = new CoreWindow(instance);
        console.log(info.id, info);
        CoreWindowManager.coreWindowMap.set(info.id, info);

        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-created', info),
        );

        return info;
    }

    static getWindowById(id: string): CoreWindow {
        return CoreWindowManager.coreWindowMap.get(id);
    }

    static deleteWindowById(id: string): void {
        let window = CoreWindowManager.coreWindowMap.get(id);
        if (!window) return;

        CoreWindowLayoutManager.getInstance().removeWindowFromLayout(window);

        Events.getInstance().dispatchEvent(
            new CoreWindowEvent('core-window-destroyed', window),
        );

        if (window) {
            let instance = window.instance;
            let index = instance.windows.indexOf(window);
            if (index > -1) {
                instance.windows.splice(index, 1);
            }

            if (instance.windows.length === 0) {
                AppInstanceManager.terminateInstance(instance);
            }

            CoreWindowManager.coreWindowMap.delete(id);
        }
    }
}
