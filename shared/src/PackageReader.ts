import { PackageApplication, ForegroundText } from "./PackageApplication";
import { ApplicationSplashScreen } from "./ApplicationSplashScreen";
import { ApplicationDefaultTile } from "./ApplicationDefaultTile";
import { ApplicationVisualElements } from "./ApplicationVisualElements";
import { Package } from "./Package";
import { PackageCompatibilityMode } from "./PackageCompatibilityMode";
import { PackageIdentity } from "./PackageIdentity";
import { PackageProperties } from "./PackageProperties";

import * as base32 from "base32.js"

const AppX2010ManifestNS = "http://schemas.microsoft.com/appx/2010/manifest";
const AppX2013ManifestNS = "http://schemas.microsoft.com/appx/2013/manifest";

export class PackageReader {

    private parser: DOMParser;
    private packageManifest: string;

    private identity: PackageIdentity;
    private compatibilityMode: PackageCompatibilityMode;

    constructor(packageManifest: string, parser?: DOMParser) {
        this.packageManifest = packageManifest ?? ``;
        this.parser = parser ?? new DOMParser();
    }

    async readPackage(): Promise<Package> {
        const pack: Package = { path: "", applications: {} };
        const manifestDocument = this.parser.parseFromString(this.packageManifest, 'application/xml');

        if (manifestDocument === null) {
            throw new Error("Manifest failed to parse!");
        }

        const identityElement = manifestDocument.getElementsByTagNameNS(AppX2010ManifestNS, "Identity")[0]!;
        const propertiesElement = manifestDocument.getElementsByTagNameNS(AppX2010ManifestNS, "Properties")[0]!;
        const applicationsElement = manifestDocument.getElementsByTagNameNS(AppX2010ManifestNS, "Applications")[0]!;
        const osMinVersion = manifestDocument.getElementsByTagNameNS(AppX2010ManifestNS, "OSMinVersion")[0]?.textContent;

        if (!osMinVersion || osMinVersion.startsWith("6.3")) {
            pack.compatibilityMode = PackageCompatibilityMode.windows81;
        }
        else if (osMinVersion.startsWith("6.2")) {
            pack.compatibilityMode = PackageCompatibilityMode.windows80;
        }

        this.compatibilityMode = pack.compatibilityMode!;
        this.identity = pack.identity = this.loadTextResources(await this.readIdentity(identityElement));

        console.log(`loading package ${this.identity.packageFamilyName} with mode ${PackageCompatibilityMode[this.compatibilityMode]}`);

        pack.properties = this.loadTextResources(this.readProperties(propertiesElement));

        const applicationElements = applicationsElement.getElementsByTagNameNS(AppX2010ManifestNS, "Application");
        for (let i = 0; i < applicationElements.length; i++) {
            const applicationElement = applicationElements[i];
            const application = this.loadTextResources(this.readApplication(applicationElement));
            pack.applications[application.id] = application;
        }

        pack.path = "/packages/" + this.identity.packageFamilyName + "/";

        return pack;
    }

    private async readIdentity(element: Element): Promise<PackageIdentity> {
        const name = element.getAttribute("Name")!;
        const publisher = element.getAttribute("Publisher")!;
        const version = element.getAttribute("Version")!;

        // compute the PackageFamilyName as base32 crockford of the first 8 bytes of the SHA256
        // hash of the Publisher field.

        const buffer = new ArrayBuffer(publisher.length * 2)
        const bufView = new Uint16Array(buffer);
        for (let i = 0; i < publisher.length; i++) {
            bufView[i] = publisher.charCodeAt(i);
        }

        const crypto = globalThis.crypto ?? require("crypto");
        const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bufView));
        const encoder = new base32.Encoder({ type: "crockford", lc: true });
        const str = encoder.write([...hash.slice(0, 8)]).finalize();
        const packageFamilyName = name + "_" + str.toLowerCase();

        return { name, publisher, version, packageFamilyName };
    }

    private readProperties(element: Element): PackageProperties {
        const displayName = element.getElementsByTagNameNS(AppX2010ManifestNS, "DisplayName")[0]!.textContent!;
        const description = element.getElementsByTagNameNS(AppX2010ManifestNS, "Description")[0]?.textContent!;
        const publisherDisplayName = element.getElementsByTagNameNS(AppX2010ManifestNS, "PublisherDisplayName")[0]!.textContent!;
        const logo = this.fixupUrl(element.getElementsByTagNameNS(AppX2010ManifestNS, "Logo")[0]?.textContent)!;

        return { displayName, description, publisherDisplayName, logo };
    }

    private readApplication(element: Element): PackageApplication {
        const id = element.getAttribute("Id")!;
        const startPage = element.getAttribute("StartPage")!;

        const visualElementsElement = element.getElementsByTagNameNS(AppX2013ManifestNS, "VisualElements")[0]!;
        const visualElements = this.loadTextResources(this.readVisualElements(visualElementsElement));

        // this will become important eventually (share targets, etc.)
        // let extensionsElement = element.getElementsByTagNameNS(AppX2018ManifestNS, "Extensions")[0];
        // for (const extensionElement of extensionsElement.childNodes) {
        // }
        return { id, startPage, visualElements, extensions: [] };
    }

    private readVisualElements(element: Element): ApplicationVisualElements {
        const visualElements: Partial<ApplicationVisualElements> = {};
        visualElements.displayName = element.getAttribute("DisplayName")!;
        visualElements.description = element.getAttribute("Description")!;
        visualElements.foregroundText = <ForegroundText>element.getAttribute("ForegroundText")?.toLowerCase();
        visualElements.backgroundColor = element.getAttribute("BackgroundColor")!;

        if (this.compatibilityMode === PackageCompatibilityMode.windows80) {
            visualElements.square150x150Logo = this.fixupUrl(element.getAttribute("Logo"))!;
            visualElements.square30x30Logo = this.fixupUrl(element.getAttribute("SmallLogo"))!;
        }
        else {
            visualElements.square150x150Logo = this.fixupUrl(element.getAttribute("Square150x150Logo"))!;
            visualElements.square30x30Logo = this.fixupUrl(element.getAttribute("Square30x30Logo"))!;
        }

        const defaultTileElement = element.getElementsByTagNameNS(AppX2013ManifestNS, "DefaultTile")[0];
        if (defaultTileElement !== null) {
            visualElements.defaultTile = this.loadTextResources(this.readDefaultTile(defaultTileElement));
        }
        else {
            visualElements.defaultTile = { shortName: visualElements.displayName };
        }

        const splashScreenElement = element.getElementsByTagNameNS(AppX2013ManifestNS, "SplashScreen")[0]!;
        visualElements.splashScreen = this.readSplashScreen(splashScreenElement);

        return <ApplicationVisualElements>visualElements;
    }

    private readSplashScreen(element: Element): ApplicationSplashScreen {
        //let splashScreen = new ApplicationSplashScreen();
        let backgroundColor = element.getAttribute("BackgroundColor")!;
        let image = this.fixupUrl(element.getAttribute("Image"))!;

        return { backgroundColor, image };
    }

    private readDefaultTile(element: Element): ApplicationDefaultTile {
        let defaultTile: Partial<ApplicationDefaultTile> = { showNameOnTiles: [] };
        defaultTile.shortName = element.getAttribute("ShortName")!;

        if (this.compatibilityMode == PackageCompatibilityMode.windows80) {
            defaultTile.wide310x150Logo = this.fixupUrl(element.getAttribute("WideLogo"))!;

            var showName = element.getAttribute("ShowName");
            if (showName === "allLogos") {
                defaultTile.showNameOnTiles!.push("square150x150");
                defaultTile.showNameOnTiles!.push("wide310x150");
            }
            else if (showName == "logoOnly") {
                defaultTile.showNameOnTiles!.push("square150x150");
            }
            else if (showName == "wideLogoOnly") {
                defaultTile.showNameOnTiles!.push("wide310x150");
            }
        }
        else {
            defaultTile.square70x70Logo = this.fixupUrl(element.getAttribute("Square70x70Logo"))!;
            defaultTile.wide310x150Logo = this.fixupUrl(element.getAttribute("Wide310x150Logo"))!;
            defaultTile.square310x310Logo = this.fixupUrl(element.getAttribute("Square310x310Logo"))!;

            const showOnElements = element.getElementsByTagNameNS(AppX2013ManifestNS, "ShowOn");
            for (let i = 0; i < showOnElements.length; i++) {
                const showOnElement = showOnElements[i];
                const tile = showOnElement.getAttribute("Tile")!;
                defaultTile.showNameOnTiles!.push(tile.substring(0, tile.length - 4));
            }
        }

        let tileUpdate = element.getElementsByTagNameNS(AppX2013ManifestNS, "TileUpdate")[0];
        if (tileUpdate) {
            defaultTile.tileUpdateUrl = tileUpdate.getAttribute("UriTemplate")!;
        }

        return <ApplicationDefaultTile>defaultTile;
    }

    private fixupUrl(relativeUrl: string | null | undefined): string | null {
        if (relativeUrl)
            return `/packages/${this.identity.packageFamilyName}/${relativeUrl}`;
        return null;
    }

    private loadTextResources<T>(object: T): T {
        return object;
    }
}
