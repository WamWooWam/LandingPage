import { PackageApplication, ForegroundText } from "./PackageApplication";
import { ApplicationSplashScreen } from "./ApplicationSplashScreen";
import { ApplicationDefaultTile } from "./ApplicationDefaultTile";
import { ApplicationVisualElements } from "./ApplicationVisualElements";
import { Package } from "./Package";
import { PackageCompatibilityMode } from "./PackageCompatibilityMode";
import { PackageIdentity } from "./PackageIdentity";
import { PackageProperties } from "./PackageProperties";
import base32Encode from 'base32-encode';

export class PackageReader {

    private packageManifest: string;

    private identity: PackageIdentity;
    private compatibilityMode: PackageCompatibilityMode;

    constructor(packageManifest?: string) {
        this.packageManifest = packageManifest;
    }

    async readPackage(): Promise<Package> {
        //let pack = new Package(this.packagePath);
        let pack: Package = { path: "", applications: new Map() };
        let manifestDocument = new DOMParser()
            .parseFromString(this.packageManifest, 'application/xml');

        if (manifestDocument === null) {
            throw new Error("Manifest failed to parse!");
        }

        let identityElement = manifestDocument.querySelector("Identity");
        let propertiesElement = manifestDocument.querySelector("Properties");
        let applicationsElement = manifestDocument.querySelector("Applications");
        let osMinVersion = manifestDocument.querySelector("OSMinVersion")?.textContent;

        if (!osMinVersion || osMinVersion.startsWith("6.3")) {
            pack.compatibilityMode = PackageCompatibilityMode.windows81;
        }
        else if (osMinVersion.startsWith("6.2")) {
            pack.compatibilityMode = PackageCompatibilityMode.windows80;
        }

        this.compatibilityMode = pack.compatibilityMode;
        this.identity = pack.identity = this.loadTextResources(await this.readIdentity(identityElement));

        console.log(`loading package ${this.identity.packageFamilyName} with mode ${PackageCompatibilityMode[this.compatibilityMode]}`);

        pack.properties = this.loadTextResources(this.readProperties(propertiesElement));

        const applicationElements = applicationsElement.querySelectorAll("Application");
        for (let i = 0; i < applicationElements.length; i++) {
            const applicationElement = applicationElements[i];
            const application = this.loadTextResources(this.readApplication(applicationElement));
            pack.applications.set(application.id, application);
        }

        pack.path = "/packages/" + this.identity.packageFamilyName + "/";

        return pack;
    }

    private async readIdentity(element: Element): Promise<PackageIdentity> {
        let name = element.getAttribute("Name");
        let publisher = element.getAttribute("Publisher");
        let version = element.getAttribute("Version");

        // compute the PackageFamilyName as base32 crockford of the first 8 bytes of the SHA256
        // hash of the Publisher field.
        const buffer = new ArrayBuffer(publisher.length * 2);
        const bufView = new Uint16Array(buffer);
        for (let i = 0; i < publisher.length; i++) {
            bufView[i] = publisher.charCodeAt(i);
        }

        let packageFamilyName = name + "_zfgz6xjnaz0ym";
        try {
            const hash = await crypto.subtle.digest('SHA-256', bufView);
            const base32 = base32Encode(hash.slice(0, 8), 'Crockford');
            packageFamilyName = name + "_" + base32.toLowerCase();
        }
        catch (e) {
        }

        return { name, publisher, version, packageFamilyName };
    }

    private readProperties(element: Element): PackageProperties {
        let displayName = element.querySelector("DisplayName").textContent;
        let description = element.querySelector("Description")?.textContent;
        let publisherDisplayName = element.querySelector("PublisherDisplayName").textContent;
        let logo = this.fixupUrl(element.querySelector("Logo").textContent);

        return { displayName, description, publisherDisplayName, logo };
    }

    private readApplication(element: Element): PackageApplication {
        let id = element.getAttribute("Id");
        let startPage = element.getAttribute("StartPage");

        let visualElementsElement = element.querySelector("VisualElements");
        let visualElements = this.loadTextResources(this.readVisualElements(visualElementsElement));

        // this will become important eventually (share targets, etc.)
        // let extensionsElement = element.querySelector("Extensions");
        // for (const extensionElement of extensionsElement.childNodes) {
        // }
        return { id, startPage, visualElements, extensions: [] };
    }

    private readVisualElements(element: Element): ApplicationVisualElements {
        let visualElements: Partial<ApplicationVisualElements> = {};
        visualElements.displayName = element.getAttribute("DisplayName");
        visualElements.description = element.getAttribute("Description");
        visualElements.foregroundText = <ForegroundText>element.getAttribute("ForegroundText")?.toLowerCase();
        visualElements.backgroundColor = element.getAttribute("BackgroundColor");

        if (this.compatibilityMode === PackageCompatibilityMode.windows80) {
            visualElements.square150x150Logo = this.fixupUrl(element.getAttribute("Logo"));
            visualElements.square30x30Logo = this.fixupUrl(element.getAttribute("SmallLogo"));
        }
        else {
            visualElements.square150x150Logo = this.fixupUrl(element.getAttribute("Square150x150Logo"));
            visualElements.square30x30Logo = this.fixupUrl(element.getAttribute("Square30x30Logo"));
        }

        let defaultTileElement = element.querySelector("DefaultTile");
        if (defaultTileElement !== null) {
            visualElements.defaultTile = this.loadTextResources(this.readDefaultTile(defaultTileElement));
        }
        else {
            visualElements.defaultTile = { shortName: visualElements.displayName };
        }

        let splashScreenElement = element.querySelector("SplashScreen");
        visualElements.splashScreen = this.readSplashScreen(splashScreenElement);

        return <ApplicationVisualElements>visualElements;
    }

    private readSplashScreen(element: Element): ApplicationSplashScreen {
        //let splashScreen = new ApplicationSplashScreen();
        let backgroundColor = element.getAttribute("BackgroundColor");
        let image = this.fixupUrl(element.getAttribute("Image"));

        return { backgroundColor, image };
    }

    private readDefaultTile(element: Element): ApplicationDefaultTile {
        let defaultTile: Partial<ApplicationDefaultTile> = { showNameOnTiles: [] };
        defaultTile.shortName = element.getAttribute("ShortName");

        if (this.compatibilityMode == PackageCompatibilityMode.windows80) {
            defaultTile.wide310x150Logo = this.fixupUrl(element.getAttribute("WideLogo"));

            var showName = element.getAttribute("ShowName");
            if (showName === "allLogos") {
                defaultTile.showNameOnTiles.push("square150x150");
                defaultTile.showNameOnTiles.push("wide310x150");
            }
            else if (showName == "logoOnly") {
                defaultTile.showNameOnTiles.push("square150x150");
            }
            else if (showName == "wideLogoOnly") {
                defaultTile.showNameOnTiles.push("wide310x150");
            }
        }
        else {
            defaultTile.square70x70Logo = this.fixupUrl(element.getAttribute("Square70x70Logo"));
            defaultTile.wide310x150Logo = this.fixupUrl(element.getAttribute("Wide310x150Logo"));
            defaultTile.square310x310Logo = this.fixupUrl(element.getAttribute("Square310x310Logo"));

            const showOnElements = element.querySelectorAll("ShowOn");
            for (let i = 0; i < showOnElements.length; i++) {
                const showOnElement = showOnElements[i];
                const tile = showOnElement.getAttribute("Tile");
                defaultTile.showNameOnTiles.push(tile.substring(0, tile.length - 4));
            }
        }

        let tileUpdate = element.querySelector("TileUpdate");
        if (tileUpdate) {
            defaultTile.tileUpdateUrl = tileUpdate.getAttribute("UriTemplate");
        }

        return <ApplicationDefaultTile>defaultTile;
    }

    private fixupUrl(relativeUrl: string): string {
        if (relativeUrl)
            return `/packages/${this.identity.packageFamilyName}/${relativeUrl}`;
        return null;
    }

    private loadTextResources<T>(object: T): T {
        return object;
    }
}
