const path = require('path');
const fs = require('fs');
const { DOMParser, XMLSerializer } = require('xmldom');
const { minify } = require('minify-xml');
const crypto = require('crypto');
const base32 = require('base32.js');

async function readIdentity(element) {
    let name = element.getAttribute("Name");
    let publisher = element.getAttribute("Publisher");
    let version = element.getAttribute("Version");

    // compute the PackageFamilyName as base32 crockford of the first 8 bytes of the SHA256
    // hash of the Publisher field.

    const buffer = new ArrayBuffer(publisher.length * 2)
    const bufView = new Uint16Array(buffer);
    for (let i = 0; i < publisher.length; i++) {
        bufView[i] = publisher.charCodeAt(i);
    }

    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bufView));

    var encoder = new base32.Encoder({ type: "crockford", lc: true });
    var str = encoder.write([...hash.slice(0, 8)]).finalize();
    packageFamilyName = name + "_" + str.toLowerCase();

    return { name, publisher, version, packageFamilyName };
}

module.exports = function (source) {
    let callback = this.async();

    let manifest = new DOMParser()
        .parseFromString(source, 'text/xml').documentElement;

    let mode = "windows8.1";
    let osMinVersion = manifest.getElementsByTagName("OSMinVersion")[0].textContent;

    if (osMinVersion?.startsWith("6.2")) {
        mode = "windows8";
    }
    let rootPath = path.dirname(this.resourcePath);
    // read the identity from the manifest
    let identityElement = manifest.getElementsByTagName("Identity")[0];
    readIdentity(identityElement).then(identity => {
        let addFile = (file) => {
            let filePath = path.resolve(rootPath, file);
            this.addDependency(filePath);

            this.emitFile(path.join("packages", identity.packageFamilyName, file), fs.readFileSync(filePath));
        }

        let applicationsElement = manifest.getElementsByTagName("Applications")[0];

        // collect all visual elements from the manifest

        let applicationElements = applicationsElement.getElementsByTagName("Application");
        for (let i = 0; i < applicationElements.length; i++) {
            let applicationElement = applicationElements[i];
            let visualElementsElement = applicationElement.getElementsByTagName("wb:VisualElements")[0];
            let defaultTile = visualElementsElement.getElementsByTagName("wb:DefaultTile")[0];

            let square150x150Logo = visualElementsElement.getAttribute("Square150x150Logo");
            let square30x30Logo = visualElementsElement.getAttribute("Square30x30Logo");
            let square70x70Logo = defaultTile.getAttribute("Square70x70Logo");
            let wide310x150Logo = defaultTile.getAttribute("Wide310x150Logo");
            let square310x310Logo = defaultTile.getAttribute("Square310x310Logo");

            addFile(square150x150Logo);
            addFile(square30x30Logo);
            addFile(square70x70Logo);
            addFile(wide310x150Logo);
            addFile(square310x310Logo);
        }

        // add the manifest to the output
        addFile("AppxManifest.xml");

        // return the manifest XML as a string
        return callback(null, minify(new XMLSerializer().serializeToString(manifest)));
    });
}