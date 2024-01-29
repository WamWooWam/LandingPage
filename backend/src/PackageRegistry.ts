import { Package } from "landing-page-shared";

export default class PackageRegistry {
    static packages: Map<string, Package> = new Map();

    static getPackage(id: string): Package {
        var pack = PackageRegistry.packages.get(id);
        return pack;
    }

    static registerPackage(pack: Package) {
        PackageRegistry.packages.set(pack.identity.packageFamilyName, pack);
    }
}