const path = require('path');
const fs = require('fs');
const { PackageReader } = require('landing-page-shared');

module.exports = function (source) {
    let callback = this.async();

    let reader = new PackageReader(source);
    let rootPath = path.dirname(this.resourcePath);

    let addFile = (file) => {
        if (!file) return;

        // if this is a webp, check if a png version exists and use that too
        if (file.endsWith(".webp")) {
            let pngFile = file.substring(0, file.length - 5) + ".png";
            addFile(pngFile);
        }

        let filePath = path.resolve(rootPath, file);
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

    reader.readPackage().then((manifest) => {
        for (const id in manifest.applications) {
            let application = manifest.applications[id];
            let visualElements = application.visualElements;

            addFile(visualElements.square150x150Logo);
            addFile(visualElements.square30x30Logo);
            addFile(visualElements.wide310x150Logo);
            addFile(visualElements.defaultTile.square70x70Logo);
            addFile(visualElements.defaultTile.wide310x150Logo);
            addFile(visualElements.splashScreen.image);
        }

        return callback(null, `export default ${JSON.stringify(manifest)};`);
    });
}