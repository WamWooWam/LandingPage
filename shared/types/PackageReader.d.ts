import { Package } from './Package';
export declare class PackageReader {
    private parser;
    private packageManifest;
    private identity;
    private compatibilityMode;
    constructor(packageManifest: string, parser?: DOMParser);
    readPackage(): Promise<Package>;
    private readIdentity;
    private readProperties;
    private readApplication;
    private readVisualElements;
    private readSplashScreen;
    private readDefaultTile;
    private readCapabilities;
    private readCapability;
    private fixupUrl;
    private loadTextResources;
}
