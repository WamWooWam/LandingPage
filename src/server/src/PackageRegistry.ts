import { Package } from "@landing-page/shared";

export default class PackageRegistry {
    static __packages: Map<string, Package> = new Map();

    static getPackage(id: string): Package {
        var pack = PackageRegistry.__packages.get(id);
        return pack;
    }

    static registerPackage(pack: Package) {
        PackageRegistry.__packages.set(pack.identity.packageFamilyName, pack);
    }

    static get packages() {
        return PackageRegistry.__packages.values();
    }
}