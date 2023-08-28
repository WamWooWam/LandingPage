import { render } from 'preact-render-to-string';
import { Resvg } from '@resvg/resvg-js';
import { DOMParser, XMLSerializer } from 'xmldom';
import * as fs from 'node:fs'
import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import {
    parseLayout,
    FenceTileProps,
    TileProps,
    TilePropsWithType,
    collapseTiles,
    layoutDesktop,
    lightenDarkenColour2,
    PackageReader,
    PackageApplication,
    Package,
    TileSize
} from "landing-page-shared";

export namespace Thumbnail {
    const TEMP_PATH = path.join(os.tmpdir(), 'landing-page-cache');
    const THUMBNAIL_PATH = path.join(TEMP_PATH, 'thumbnail');

    const PackageMap = new Map<string, Package>();

    const Tile = (props: { x: number, y: number, width: number, height: number, fill: string, image: string, text: string, textStyle: string }) => {

        let textElement = props.text &&
            <text x={8}
                y={props.height - 8}
                font-size="7.5pt"
                fill={props.textStyle === 'light' ? 'white' : 'black'} 
                style={`font-family: 'Segoe UI';`}>
                    {props.text}
            </text>;

        let imageUrl = `../frontend/dist${props.image}`;
        if (imageUrl.endsWith('.svg')) {
            const content = fs.readFileSync('../frontend/dist/' + props.image, 'utf-8');
            const doc = new DOMParser().parseFromString(content, 'application/xml');
            let xml = new XMLSerializer().serializeToString(doc.documentElement);

            return (
                <g transform={`translate(${props.x}, ${props.y})`}>
                    <rect x={0} y={0} width={props.width} height={props.height} fill={props.fill} />
                    <g dangerouslySetInnerHTML={{ __html: xml }} transform={`scale(0.575)`} />
                    {textElement}
                </g>
            )
        }
        else {
            if (imageUrl.endsWith('.webp')) {
                imageUrl = imageUrl.replace('.webp', '.png');
            }

            let image = fs.readFileSync(imageUrl, 'base64');
            let base64 = `data:image/png;base64,${image}`;

            return (
                <g transform={`translate(${props.x}, ${props.y})`}>
                    <rect x={0} y={0} width={props.width} height={props.height} fill={props.fill} />
                    <image href={base64} x={0} y={0} width={props.width} height={props.height} />
                    {textElement}
                </g>
            );
        }
    }

    const TileGroup = (props: { title: string, tiles: TilePropsWithType[], x: number, y: number }) => {
        // render each tile as a styled svg rect
        let tiles = props.tiles.map((tile, index) => {
            let row = tile.row!;
            let column = tile.column!;
            let widthInColumns = tile.width;
            let heightInRows = tile.height;

            // layout tiles in a grid of 84px cells with 4px padding
            let x = props.x + column * 88;
            let y = props.y + row * 88;

            if (tile.type === "fence") {
                // a fence has up to 4 smaller tiles inside it also laid out in a grid of 34px cells with 4px padding
                let fenceTiles = (tile as FenceTileProps).apps.map((tile, index) => {
                    let row = index % 2;
                    let column = Math.floor(index / 2);

                    // layout tiles in a grid of 34px cells with 4px padding
                    let x1 = column * 44;
                    let y1 = row * 44;

                    let { image, fill } = getData(tile as any, PackageMap);

                    return (
                        <Tile x={x1} y={y1} width={40} height={40} fill={fill} image={image} text={null} textStyle={null} />
                    )
                });

                return (
                    <g transform={`translate(${x}, ${y})`}>{fenceTiles}</g>
                )
            }

            let { image, app, fill, text, textStyle } = getData(tile, PackageMap);

            return (
                <Tile x={x} y={y} width={widthInColumns * 88 - 4} height={heightInRows * 88 - 4} fill={fill} image={image} text={text} textStyle={textStyle} />
            )
        });

        return (
            <>
                <text x={props.x} y={props.y - 8} font-size="12pt" fill="white" style={"font-family: 'Segoe UI'; font-weight: 300;"}>{props.title}</text>
                {tiles}
            </>
        )

    }

    const generateThumbnail = async () => {
        const startLayout = await fsp.readFile('../packages/StartScreen.xml', 'utf-8');
        const tileGroups = parseLayout(startLayout);

        if (PackageMap.size == 0) {
            const packages = await fsp.readdir('../packages');
            for (let packageName of packages) {
                await loadPackage(packageName, PackageMap);
            }
        }

        let x = 58;
        let renderedTileGroups = [];
        for (let tileGroup of tileGroups) {
            let collapsedTiles = collapseTiles(tileGroup.tiles);
            let layout = layoutDesktop(collapsedTiles, 600);
            let maxColumn = Math.max(...layout.map(t => t.column + t.width));

            renderedTileGroups.push(
                <TileGroup {...tileGroup} tiles={layout} x={x} y={120} />
            )

            x += maxColumn * 88 + 20;
        };

        // map each application to packageFamilyName!appId
        let renderedTiles = [];
        for (let [packageFamilyName, packageInfo] of PackageMap.entries()) {
            for (let appId in packageInfo.applications) {
                let app = packageInfo.applications[appId];
                renderedTiles.push(
                    <linearGradient id={`${packageFamilyName}!${appId}`}>
                        <stop offset="0%" stop-color={app.visualElements.backgroundColor} />
                        <stop offset="100%" stop-color={lightenDarkenColour2(app.visualElements.backgroundColor, 0.05)} />
                    </linearGradient>
                )
            }
        }

        return render(
            <svg width="1280" height="800" viewBox="0 0 640 400"
                fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {renderedTiles}
                </defs>
                <rect width="640" height="400" fill="#04016c" />
                <text x={58} y={72} font-size="42pt" fill="white" style={"font-family: 'Segoe UI'; font-weight: 300;"}>Start</text>

                {renderedTileGroups}
            </svg>
        );
    }

    export const generateThumbnailSvg = async (path) => {
        let svg = await generateThumbnail();
        await fsp.writeFile(path, svg);
    };

    export const generateThumbnailPng = async (path) => {
        const svg = await generateThumbnail();
        const options = {
            background: '#000000',
            fitTo: {
                mode: 'width',
                value: 1280,
            },
            font: {
                fontFiles: [
                    './fonts/segoeui.ttf',
                    './fonts/segoeuil.ttf',
                ],
                loadSystemFonts: false,
                defaultFontFamily: 'Segoe UI'
            }
        }

        const resvg = new Resvg(svg, options as any);
        const png = resvg.render().asPng();

        await fsp.writeFile(path, png, 'binary');
    }

    async function loadPackage(name: string, map: Map<string, Package>) {
        try {
            const appxManifest = await fsp.readFile(`../packages/${name}/AppxManifest.xml`, 'utf-8');

            let parser = new PackageReader(appxManifest, new DOMParser());
            let manifest = await parser.readPackage();
            map.set(manifest.identity.packageFamilyName, manifest);
        }
        catch (e) {
        }
    }
}

function getData(tile: TilePropsWithType, PackageMap: Map<string, Package>) {
    let tileProps = tile as TileProps;
    let packageInfo = PackageMap.get(tileProps.packageName);
    let app = packageInfo.applications[tileProps.appId];

    let image = app.visualElements.square150x150Logo;
    switch (tileProps.size) {
        case TileSize.square70x70:
            image = app.visualElements.defaultTile.square70x70Logo;
            break;
        case TileSize.square150x150:
            image = app.visualElements.square150x150Logo;
            break;
        case TileSize.wide310x150:
            image = app.visualElements.defaultTile.wide310x150Logo;
            break;
        case TileSize.square310x310:
            image = app.visualElements.defaultTile.square310x310Logo;
            break;
    }

    let text = '';
    if (app.visualElements.defaultTile.showNameOnTiles.includes(TileSize[tileProps.size])) {
        text = app.visualElements.displayName;
    }

    let textStyle = app.visualElements.foregroundText;

    let fill = `url(#${tileProps.packageName}!${tileProps.appId})`;
    return { tileProps, image, app, fill, text, textStyle };
}
