import { Package } from "./Package";
export declare class PackageReader {
    private packageManifest;
    private identity;
    private compatibilityMode;
    constructor(packageManifest?: string);
    readPackage(): Promise<Package>;
    private readIdentity;
    private readProperties;
    private readApplication;
    private readVisualElements;
    private readSplashScreen;
    private readDefaultTile;
    private fixupUrl;
    private loadTextResources;
}
