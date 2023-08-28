import CoreWindow from "./CoreWindow";
import { Package } from "shared/Package"
import { PackageApplication } from "shared/PackageApplication"
import { newGuid } from "../Util";

export default class AppInstance {
    readonly id: string;
    readonly package: Package;
    readonly packageApplication: PackageApplication;
    readonly windows: CoreWindow[];
    readonly userData: Map<string, any>;

    get mainWindow(): CoreWindow {
        return this.windows[0];
    }

    constructor(pack: Package, packageApplication: PackageApplication) {
        this.id = `AppInstance_${newGuid()}`;
        this.package = pack;
        this.packageApplication = packageApplication;
        this.windows = [];
        this.userData = new Map<string, any>();
    }
}
