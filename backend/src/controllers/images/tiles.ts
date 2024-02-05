import { PackageApplication, lightenDarkenColour2 } from "landing-page-shared";
import { Request, Response } from "express";

import { Resvg } from "@resvg/resvg-js"
import { getAppAndPackage } from "../../utils";

import path = require('path');
import fs = require('fs');
import os = require('os');

import sharp = require('sharp');

// api/images/:type/:package/:app/:size
async function getImage(req: Request, res: Response) {
    const { app, appId, packageId } = getAppAndPackage(req.params.app, req.params.package);

    let rawSize = req.params.size?.toLowerCase();
    let type = req.params.type?.toLowerCase();

    if ((type !== 'plated' && type !== 'normal') || !rawSize) {
        res.status(400).send('Bad Request');
        return;
    }

    let { image, width, height, color, size } = parseSize(app, rawSize);
    if (!image) {
        res.status(404).send('Not found!');
        return;
    }

    let sourceImage = path.join(process.cwd(), "..", "frontend", "dist", image);
    if (!fs.existsSync(sourceImage)) {
        res.status(404).send('Not found!');
        return;
    }

    console.log(`[Tiles] Rendering ${image}`);

    // remove leading slashes
    while (image.startsWith('/')) {
        image = image.substring(1);
    }

    let data: Buffer = null;
    if (image.endsWith('.svg')) {
        // this may seem pointless, as sharp can read SVG, but most SVGs embed other SVGs or images
        // which sharp doesn't handle because fuck me i guess
        let svg = await fs.promises.readFile(sourceImage, 'utf8');
        let resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: false } });

        const rendered = resvg.render();
        data = rendered.asPng();
    }
    else {
        data = await fs.promises.readFile(sourceImage);
    }

    let img = sharp(data);
    img = img.resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

    if (type === 'plated') {
        if (["splash", "square30x30logo"].includes(size.toLowerCase())) {
            img = img.flatten({ background: color });
        }
        else {
            // generate svg gradient
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${color}"/>
            <stop offset="100%" stop-color="${lightenDarkenColour2(color, 0.05)}"/>
        </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#gradient)"/>
    <rect width="${width - 2}" height="${height - 2}" x="1" y="1" fill="transparent" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
</svg>`;

            let bgImage = sharp(Buffer.from(svg));
            bgImage.composite([{ input: await img.toBuffer(), blend: 'atop' }]);

            img = bgImage;
        }

        let png = img.png();
        let buffer = await png.toBuffer();
        res.set('Content-Type', 'image/png')
            .send(buffer);
    }
}

function parseSize(app: PackageApplication, size: string) {
    let image: string = null;
    let color = app.visualElements.backgroundColor;
    let width = 0;
    let height = 0;
    switch (size) {
        case 'splash':
        case 'splashscreen':
        case 'splash-screen':
            size = 'splashScreen';
            width = 620;
            height = 300;
            image = app.visualElements.splashScreen.image;
            if (app.visualElements.splashScreen.backgroundColor && app.visualElements.splashScreen.backgroundColor !== '') {
                color = app.visualElements.splashScreen.backgroundColor;
            }
            break;
        case 'square30x30logo':
            size = 'square30x30Logo';
            image = app.visualElements.square30x30Logo;
            width = height = 30;
            break;
        case 'square150x150logo':
            size = 'square150x150Logo';
            image = app.visualElements.square150x150Logo;
            width = height = 150;
            break;
        case 'wide310x150logo':
            size = 'wide310x150Logo';
            image = app.visualElements.defaultTile.wide310x150Logo;
            width = 310;
            height = 150;
            break;
        case 'square310x310logo':
            size = 'square310x310Logo';
            image = app.visualElements.defaultTile.square310x310Logo;
            width = height = 310;
            break;
        case 'square70x70logo':
            size = 'square70x70Logo';
            image = app.visualElements.defaultTile.square70x70Logo;
            width = height = 70;
            break;
        case 'appletouchicon':
        case 'apple-touch-icon':
            size = 'appleTouchIcon';
            image = app.visualElements.defaultTile.square70x70Logo ?? app.visualElements.square150x150Logo;
            width = height = 120;
            break;
    }
    return { image, width, height, color, size };
}


export default function registerRoutes(router) {
    router.get('/:type/:package/:app/:size', getImage);
}