import { PackageApplication } from "./PackageApplication";
import { PackageCompatibilityMode } from "./PackageCompatibilityMode";
import { PackageIdentity } from "./PackageIdentity";
import { PackageProperties } from "./PackageProperties";

export interface Package {
    path: string;
    identity?: PackageIdentity;
    properties?: PackageProperties;
    applications?: { [part: string]: PackageApplication };
    compatibilityMode?: PackageCompatibilityMode;
}


