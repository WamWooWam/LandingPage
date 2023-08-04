import { Package } from "shared/Package";

export default class PackageRegistry {
    static packages: Map<string, Package> = new Map();

    static getPackage(id: string): Package {
        var pack = PackageRegistry.packages.get(id);
        return pack;
    }

    static registerPackage(pack: Package) {
        console.log(`registering %O as ${pack.identity.packageFamilyName}`, pack);
        PackageRegistry.packages.set(pack.identity.packageFamilyName, pack);

        for (const id in pack.applications) {
            const app = pack.applications[id];
            // BUGBUG: hacky check for standalone app mode, dont use CoreWindowManager to avoid bringing in the dependency
            if (app.load && !window.location.pathname.match(/\/app\//)) {
                // pre-cache some visual assets for slow connections
                fetch(app.visualElements.square30x30Logo)
                    .then(resp => resp.blob())
                    .then(blob => {
                        let url = URL.createObjectURL(blob);
                        app.visualElements.square30x30Logo = url;
                    });
                fetch(app.visualElements.splashScreen.image)
                    .then(resp => resp.blob())
                    .then(blob => {
                        let url = URL.createObjectURL(blob);
                        app.visualElements.splashScreen.image = url;
                    });
            }
        }
    }
}