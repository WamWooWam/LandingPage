import { Package } from "@landing-page/shared";

export default class PackageRegistry {
    static packages: Map<string, Package> = new Map();

    static getPackage(id: string): Package {
        var pack = PackageRegistry.packages.get(id);
        return pack;
    }

    static registerPackage(pack: Package) {
        console.log(`registering %O as ${pack.identity.packageFamilyName}`, pack);

        let packageClone = structuredClone(pack);
        let appMap = new Map<string, any>();
        for (const [appId, app] of Object.entries(pack.applications || {})) {
            appMap.set(appId, app);
        }

        packageClone.applications = appMap;

        console.log(`registered package: %O`, packageClone);

        PackageRegistry.packages.set(pack.identity.packageFamilyName, packageClone);
    }
}