import { createContext } from "preact";
import { AppInstance } from "shared/AppInstance";
import { CoreWindow } from "shared/CoreWindow";

export const InstanceContext = createContext<AppInstance>(null);
export const CoreWindowContext = createContext<CoreWindow>(null);

export default function ApplicationRoot(props: { instance: AppInstance, window: CoreWindow, children: any }) {
    return (
        <InstanceContext.Provider value={props.instance}>
            <CoreWindowContext.Provider value={props.window}>
                {props.children}
            </CoreWindowContext.Provider>
        </InstanceContext.Provider>
    )
}