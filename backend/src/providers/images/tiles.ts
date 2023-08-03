import PackageRegistry from "../../PackageRegistry";
import { Canvas, Image } from "canvas";
import path = require('path');
import fs = require('fs');
import os = require('os');
import { lightenDarkenColour2 } from "landing-page-shared";
import { Resvg } from "@resvg/resvg-js"

const TEMP_PATH = path.join(os.tmpdir(), 'landing-page-cache');

export namespace Images {
    // api/images/:type/:package/:app/:size
    export async function getImage(req, res) {
        const packageId = req.params.package;
        const appId = req.params.app;
        const size = req.params.size;
        const type = req.params.type;

        if ((type !== 'plated' && type !== 'normal') || !packageId || !appId || !size) {
            res.status(400).send('Bad Request');
            return;
        }

        if (appId.startsWith('__proto__') || appId.startsWith('constructor')) {
            res.status(400).send('Bad Request');
            return;
        }

        let pack = PackageRegistry.getPackage(packageId);
        if (!pack) {
            res.status(404).send('Not found!');
            return;
        }
        let app = pack.applications[appId];
        if (!app) {
            res.status(404).send('Not found!');
            return;
        }

        let image: string = null;
        let color = app.visualElements.backgroundColor;
        let width = 0;
        let height = 0;
        switch (size.toLowerCase()) {
            case 'splash':
                width = 620;
                height = 300;
                image = app.visualElements.splashScreen.image;
                if (app.visualElements.splashScreen.backgroundColor && app.visualElements.splashScreen.backgroundColor !== '') {
                    color = app.visualElements.splashScreen.backgroundColor;
                }
                break;
            case 'square30x30logo':
                image = app.visualElements.square30x30Logo;
                width = 30;
                height = 30;
                break;
            case 'square150x150logo':
                image = app.visualElements.square150x150Logo;
                width = 150;
                height = 150;
                break;
            case 'wide310x150logo':
                image = app.visualElements.defaultTile.wide310x150Logo;
                width = 310;
                height = 150;
                break;
            case 'square310x310logo':
                image = app.visualElements.defaultTile.square310x310Logo;
                width = 310;
                height = 310;
                break;
            case 'square70x70logo':
                image = app.visualElements.defaultTile.square70x70Logo;
                width = 70;
                height = 70;
                break;
            case 'apple-touch-icon':
                image = app.visualElements.defaultTile.square70x70Logo ?? app.visualElements.square150x150Logo;
                width = 120;
                height = 120;
                break;
        }

        if (!image) {
            res.status(404).send('Not found!');
            return;
        }

        let cacheFile = path.join(TEMP_PATH, `${packageId}_${appId}_${size}_${width}_${height}_${type}.png`);
        if (fs.existsSync(cacheFile)) {
            res.sendFile(cacheFile);
            return;
        }

        console.log(`[Tiles] Rendering ${image} to ${cacheFile}`);

        // remove leading slashes
        while (image.startsWith('/')) {
            image = image.substring(1);
        }

        if (image.endsWith('.webp')) {
            image = image.substring(0, image.length - 5) + '.png';
        }

        let sourceImage = path.join(process.cwd(), "..", "frontend", "dist", image);
        let data: Buffer = null;
        if (image.endsWith('.svg')) {
            // render to png and cache
            let svg = await fs.promises.readFile(sourceImage, 'utf8');
            let resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } });

            const rendered = resvg.render();
            data = rendered.asPng();
        }
        else {
            data = await fs.promises.readFile(sourceImage);
        }

        let img = new Image;
        img.onerror = () => {
            res.status(500).send('Something went wrong! Please try again later.');
        };
        img.onload = () => {
            let canvas = new Canvas(width, height);
            let ctx = canvas.getContext('2d');

            if (type === 'plated') {
                if (["splash", "square30x30logo"].includes(size.toLowerCase())) {
                    ctx.fillStyle = color;
                    ctx.fillRect(0, 0, width, height);
                }
                else {
                    const gradient = ctx.createLinearGradient(0, 0, width, 0);
                    gradient.addColorStop(0, color);
                    gradient.addColorStop(1, lightenDarkenColour2(color, 0.05));
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width, height);
                }
            }

            ctx.drawImage(img, 0, 0, width, height);

            const buffer = canvas.toBuffer('image/png');
            fs.mkdir(path.dirname(cacheFile), { recursive: true }, (err) => {
                if (err) {
                    console.error(`[Tiles] Failed to create cache directory ${path.dirname(cacheFile)}`);
                    res.status(500).send('Something went wrong! Please try again later.');
                    return;
                }

                fs.writeFile(cacheFile, buffer, (err) => {
                    if (err) {
                        console.error(`[Tiles] Failed to write cache file ${cacheFile}`);
                        res.status(500).send('Something went wrong! Please try again later.');
                        return;
                    }

                    console.log(`[Tiles] Rendered ${image} to ${cacheFile}`);
                    res.sendFile(cacheFile);
                });
            });
        }

        img.src = data;
    }
}
