import { CoreWindow } from "./CoreWindow";
import { Package } from "./Package";
import { PackageApplication } from "./PackageApplication";

export interface AppInstance {
    id: string;
    package: Package;
    packageApplication: PackageApplication;
    mainWindow: CoreWindow;
    windows: CoreWindow[];
    userData: Map<string, any>;
}
