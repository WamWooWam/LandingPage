const path = require('path');
const fs = require('fs');
const { PackageReader } = require('landing-page-shared');
const minify = require('minify-xml').minify;

module.exports = function (source) {
    const callback = this.async();

    // set as cacheable
    this.cacheable(true);

    const reader = new PackageReader(source);

    const addFile = (file) => {
        if (!file) return;

        // if this is a webp, check if a png version exists and use that too
        if (file.endsWith(".webp")) {
            addFile(file.substring(0, file.length - 5) + ".png");
        }

        if (file.startsWith("/") || file.startsWith("\\")) {
            file = file.substring(1);
        }

        const rootPath = path.dirname(this.resourcePath);
        const filePath = path.resolve(rootPath, file);
        if (!fs.existsSync(filePath) || fs.lstatSync(filePath).isDirectory()) {
            return;
        }

        this.addDependency(filePath);

        let data = fs.readFileSync(filePath);
        if (file.endsWith(".xml") || file.endsWith(".svg")) {
            data = minify(data.toString());
        }

        this.emitFile(path.join("packages", reader.identity.packageFamilyName, file), data);
    }

    // hack
    const map = new Map();
    const fixupUrl_orig = reader.fixupUrl.bind(reader);
    const fixupUrl = (url) => {
        let fixedUrl = fixupUrl_orig(url);
        map.set(fixedUrl, url);
        return fixedUrl;
    };

    reader.fixupUrl = fixupUrl;

    reader.readPackage().then((manifest) => {
        const modules = [];

        const name = manifest.identity.packageFamilyName.replace(/\./g, "_");

        for (const id of Object.keys(manifest.applications)) {
            let application = manifest.applications[id];
            let visualElements = application.visualElements;

            addFile(map.get(visualElements.square150x150Logo));
            addFile(map.get(visualElements.square30x30Logo));
            addFile(map.get(visualElements.wide310x150Logo));
            addFile(map.get(visualElements.defaultTile.square70x70Logo));
            addFile(map.get(visualElements.defaultTile.wide310x150Logo));
            addFile(map.get(visualElements.splashScreen.image));

            if (!application.startPage.startsWith("http")) {
                modules.push(`${name}.applications['${id}'].load = (async () => await import("../../frontend/src/${application.startPage}"))`);
            }
        }

        return callback(null, `
        const ${name} = ${JSON.stringify(manifest)};
        ${modules.join(";\n")}
        export default ${name};`);
    });
}