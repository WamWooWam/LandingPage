import { render } from 'preact-render-to-string';
import { Resvg } from '@resvg/resvg-js';
import { DOMParser } from 'xmldom';
import * as fs from 'node:fs'
import * as fsp from 'node:fs/promises'
import * as os from 'node:os'
import * as path from 'node:path'

import { parseLayout, FenceTileProps, TileProps, TilePropsWithType, collapseTiles, layoutDesktop, lightenDarkenColour2, PackageReader } from "landing-page-shared";

export namespace Thumbnail {

    const TEMP_PATH = path.join(os.tmpdir(), 'landing-page-cache');
    const THUMBNAIL_PATH = path.join(TEMP_PATH, 'thumbnail');

    const Tile = (props: { x: number, y: number, width: number, height: number, fill: string }) => {
        return (
            <rect x={props.x} y={props.y} width={props.width} height={props.height} fill={props.fill} />
        )
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
                    let x1 = x + column * 44;
                    let y1 = y + row * 44;

                    return (
                        <Tile x={x1} y={y1} width={40} height={40} fill={`url(#${(tile as TileProps).appId})`} />
                    )
                });

                return (
                    <>{fenceTiles}</>
                )
            }

            return (
                <Tile x={x} y={y} width={widthInColumns * 88 - 4} height={heightInRows * 88 - 4} fill={`url(#${(tile as TileProps).appId})`} />
            )
        });

        return (
            <>
                <text x={props.x} y={props.y - 8} font-size="12pt" fill="white" style={"font-family: 'Segoe UI Light'"}>{props.title}</text>
                {tiles}
            </>
        )

    }

    const generateThumbnail = async () => {
        const startLayout = await fsp.readFile('./packages/StartScreen-test.xml', 'utf-8');
        const tileGroups = parseLayout(startLayout);

        const map = new Map<string, string>();
        const packages = await fsp.readdir('./packages');
        for (let packageName of packages) {
            await loadPackage(packageName, map);
        }

        let x = 58;
        let renderedTileGroups = [];
        for (let tileGroup of tileGroups) {
            let collapsedTiles = collapseTiles(tileGroup.tiles);
            let layout = layoutDesktop(collapsedTiles, Number.POSITIVE_INFINITY);
            let maxColumn = Math.max(...layout.map(t => t.column + t.width));

            renderedTileGroups.push(
                <TileGroup {...tileGroup} tiles={layout} x={x} y={120} />
            )

            x += maxColumn * 88 + 20;
        };

        return render(
            <svg width="1280" height="640" viewBox="0 0 640 320"
                fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    {[...map.entries()].map(([key, value]) => {
                        return (
                            <linearGradient id={key}>
                                <stop offset="0%" stop-color={value} />
                                <stop offset="100%" stop-color={lightenDarkenColour2(value, 0.02)} />
                            </linearGradient>
                        )
                    })}
                </defs>
                <rect width="640" height="320" fill="#04016c" />
                <text x={58} y={72} font-size="42pt" fill="white" style={"font-family: 'Segoe UI Light'"}>Start</text>

                {renderedTileGroups}
            </svg>
        );
    }

    export const generateThumbnailSvg = async (req, res) => {
        if (!fs.existsSync(TEMP_PATH)) {
            fs.mkdirSync(TEMP_PATH);
        }

        let svgPath = THUMBNAIL_PATH + '.svg';
        if (fs.existsSync(svgPath)) {
            res.sendFile(svgPath);
            return;
        }

        let svg = await generateThumbnail();
        await fsp.writeFile(svgPath, svg);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    };

    export const generateThumbnailPng = async (req, res) => {
        if (!fs.existsSync(TEMP_PATH)) {
            fs.mkdirSync(TEMP_PATH);
        }

        if (fs.existsSync(THUMBNAIL_PATH + '.png')) {
            res.sendFile(THUMBNAIL_PATH + '.png');
            return;
        }

        const svg = await generateThumbnail();
        const options = {
            background: '#000000',
            fitTo: {
                mode: 'width',
                value: 1280,
            },
            font: {
                fontFiles: [
                    './fonts/segoeuib.ttf',
                    './fonts/segoeuil.ttf'
                ],
                loadSystemFonts: false,
                defaultFontFamily: 'Segoe UI'
            }
        }

        const resvg = new Resvg(svg, options as any);
        const png = resvg.render().asPng();

        await fsp.writeFile(THUMBNAIL_PATH + '.png', png, 'binary');

        res.setHeader('Content-Type', 'image/png');
        res.send(png);
    }

    async function loadPackage(name: string, map: Map<string, string>) {
        try {
            const appxManifest = await fsp.readFile(`./packages/${name}/AppxManifest.xml`, 'utf-8');

            let parser = new PackageReader(appxManifest, new DOMParser());
            let manifest = await parser.readPackage();

            for (const id in manifest.applications) {
                const application = manifest.applications[id]!;
                map.set(id, application.visualElements.backgroundColor);
            }
        }
        catch (e) {
        }
    }
}