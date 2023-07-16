import { Package, PackageApplication } from "landing-page-shared";
import { AppInstance } from "./AppInstanceManager";

export interface CoreWindowInfo {
    id: string
    package: Package
    packageApplication: PackageApplication
    instance: AppInstance
    view: HTMLElement

    // title?: string;
    // splashScreenVisible?: boolean;
    // titlebarVisible?: boolean;
    // activatedDeferralId?: string;
    // loaded?: boolean;
}