import { Package } from 'shared/Package';

export default class PackageRegistry {
    static packages: Map<string, Package> = new Map();

    static getPackage(id: string): Package {
        var pack = PackageRegistry.packages.get(id);
        return pack;
    }

    static registerPackage(pack: Package) {
        console.log(
            `registering %O as ${pack.identity.packageFamilyName}`,
            pack,
        );
        PackageRegistry.packages.set(pack.identity.packageFamilyName, pack);
    }
}
