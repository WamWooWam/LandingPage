import * as fs from 'node:fs'
import * as fsp from 'node:fs/promises'
import * as path from 'node:path'

import { DOMParser, XMLSerializer } from 'xmldom';
import {
    FenceTileProps,
    Package,
    TileProps,
    TilePropsWithType,
    TileSize,
    collapseTiles,
    layoutDesktop,
    lightenDarkenColour2,
    parseLayout
} from "@landing-page/shared";

import PackageRegistry from '../../PackageRegistry';
import { Resvg, ResvgRenderOptions } from '@resvg/resvg-js';
import { Router } from 'express';
import { render } from 'preact-render-to-string';
import type { JSX } from 'preact/jsx-runtime';




const createCoordinate = (row: number, column: number, cellSize: number, padding: number) => ({
    x: column * (cellSize + padding),
    y: row * (cellSize + padding),
});

const createTileCoordinate = (tile: TilePropsWithType, x: number, y: number, cellSize: number = 88) => {
    const coordinate = createCoordinate(tile.row!, tile.column!, cellSize, 0);
    return { x: x + coordinate.x, y: y + coordinate.y };
};

const getImageData = (imageUrl: string, pack: Package, width: number, height: number): { type: 'svg' | 'base64' | 'none', content: string } => {
    if (imageUrl.startsWith('http')) return { type: 'none', content: '' };

    const fullPath = path.join(pack.path, imageUrl);
    if (fullPath.endsWith('.svg')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        // const doc = new DOMParser().parseFromString(content, 'application/xml');
        // return { type: 'svg', content: new XMLSerializer().serializeToString(doc.documentElement) };
        const options: Partial<ResvgRenderOptions> = {
            background: 'transparent',
            fitTo: {
                mode: 'width',
                value: width * 2,
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

        const resvg = new Resvg(content, options as any);
        const png = resvg.render().asPng();
        return { type: 'base64', content: `data:image/png;base64,${Buffer.from(png).toString('base64')}` };
    }

    const imagePath = fullPath.endsWith('.webp') ? fullPath.replace('.webp', '.png') : fullPath;
    const base64 = fs.readFileSync(imagePath, 'base64');
    return { type: 'base64', content: `data:image/png;base64,${base64}` };
};

const ImageElement = ({ pack, imageUrl, width, height }: { pack: Package, imageUrl: string, width: number, height: number }) => {
    const imageData = getImageData(imageUrl, pack, width, height);

    if (imageData.type === 'none') return <g />;
    if (imageData.type === 'svg') {
        return <g dangerouslySetInnerHTML={{ __html: imageData.content }} transform="scale(0.575)" />;
    }
    return <image href={imageData.content} x={0} y={0} width={width} height={height} />;
}


interface TileParams {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    image: string;
    text: string | null;
    textStyle: string | null;
}

const Tile = ({ pack, ...params }: TileParams & { pack: Package }) => (
    <g transform={`translate(${params.x}, ${params.y})`}>
        <rect x={0} y={0} width={params.width} height={params.height} fill={params.fill} />
        <ImageElement pack={pack} imageUrl={params.image} width={params.width} height={params.height} />
        {params.text && (
            <text
                x={8}
                y={params.height - 8}
                font-size="7.5pt"
                fill={params.textStyle === 'light' ? 'white' : 'black'}
                style="font-family: 'Segoe UI';">
                {params.text}
            </text>
        )}
    </g>
);

// const renderMainTile = (tile: TilePropsWithType, offsetX: number, offsetY: number) => {
const MainTile = ({ tile, offsetX, offsetY }: { tile: TilePropsWithType, offsetX: number, offsetY: number }) => {
    const { image, pack, fill, text, textStyle } = getTileData(tile);
    const { x: relX, y: relY } = createTileCoordinate(tile, 0, 0);
    const width = tile.width! * 88 - 4;
    const height = tile.height! * 88 - 4;

    return (
        <Tile
            pack={pack}
            x={offsetX + relX}
            y={offsetY + relY}
            width={width}
            height={height}
            fill={fill}
            image={image}
            text={text}
            textStyle={textStyle}
        />
    );
};

// const renderFenceTile = (tile: TilePropsWithType, offsetX: number, offsetY: number) => {
const FenceTile = ({ tile, offsetX, offsetY }: { tile: TilePropsWithType, offsetX: number, offsetY: number }) => {
    const fenceTile = tile as FenceTileProps;
    const { x: baseX, y: baseY } = createTileCoordinate(tile, 0, 0);

    const fenceTiles = fenceTile.apps.map((app, index) => {
        const row = index % 2;
        const column = Math.floor(index / 2);
        const { x: fenceX, y: fenceY } = createCoordinate(row, column, 40, 4);
        const { image, pack, fill } = getTileData(app as any);

        return (
            <Tile
                key={`fence-${index}`}
                pack={pack}
                x={fenceX}
                y={fenceY}
                width={40}
                height={40}
                fill={fill}
                image={image}
                text={null}
                textStyle={null}
            />
        );
    });

    return (
        <g transform={`translate(${offsetX + baseX}, ${offsetY + baseY})`}>
            {fenceTiles}
        </g>
    );
};

const TileGroup = (props: { title: string, tiles: TilePropsWithType[], x: number, y: number }) => {
    const tiles = props.tiles.map(tile =>
        tile.type === 'fence'
            ? <FenceTile tile={tile} offsetX={props.x} offsetY={props.y} />
            : <MainTile tile={tile} offsetX={props.x} offsetY={props.y} />
    );

    return (
        <>
            <text x={props.x} y={props.y - 8} font-size="12pt" fill="white" style="font-family: 'Segoe UI'; font-weight: 300;">
                {props.title}
            </text>
            {tiles}
        </>
    );
};

const createGradientsForPackages = () => {
    const gradients: JSX.Element[] = [];
    for (const packageInfo of PackageRegistry.packages) {
        const packageFamilyName = packageInfo.identity!.packageFamilyName;
        for (const [appId, app] of packageInfo.applications!.entries()) {
            const gradientId = `${packageFamilyName}!${appId}`;
            const darkerColor = lightenDarkenColour2(app.visualElements.backgroundColor, 0.05);
            gradients.push(
                <linearGradient key={gradientId} id={gradientId}>
                    <stop offset="0%" stop-color={app.visualElements.backgroundColor} />
                    <stop offset="100%" stop-color={darkerColor} />
                </linearGradient>
            );
        }
    }
    return gradients;
};

const generateThumbnail = async () => {
    const startLayout = await fsp.readFile(require.resolve("../../../config/StartScreen.xml"), 'utf-8');
    const tileGroups = parseLayout(startLayout, DOMParser);

    let xOffset = 58;
    const renderedGroups: JSX.Element[] = [];

    for (const tileGroup of tileGroups) {
        const collapsedTiles = collapseTiles(tileGroup.tiles);
        const layout = layoutDesktop(collapsedTiles, 600);
        const maxColumn = Math.max(...layout.map(t => t.column! + t.width!));

        renderedGroups.push(
            <TileGroup key={tileGroup.title} {...tileGroup} tiles={layout} x={xOffset} y={120} />
        );

        xOffset += maxColumn * 88 + 20;
    }

    return render(
        <svg width="1280" height="800" viewBox="0 0 640 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                {createGradientsForPackages()}
            </defs>
            <rect width="640" height="400" fill="#04016c" />
            <text x={58} y={72} font-size="42pt" fill="white" style="font-family: 'Segoe UI'; font-weight: 300;">
                Start
            </text>
            {renderedGroups}
        </svg>
    );
};


// Get tile styling and content data
const getTileData = (tile: TilePropsWithType) => {
    const tileProps = tile as TileProps;
    const pack = PackageRegistry.getPackage(tileProps.packageName);
    const app = pack.applications!.get(tileProps.appId)!;

    let image = app.visualElements.square150x150Logo;
    switch (tileProps.size) {
        case TileSize.square70x70:
            image = app.visualElements.defaultTile.square70x70Logo!;
            break;
        case TileSize.square150x150:
            image = app.visualElements.square150x150Logo!;
            break;
        case TileSize.wide310x150:
            image = app.visualElements.defaultTile.wide310x150Logo!;
            break;
        case TileSize.square310x310:
            image = app.visualElements.defaultTile.square310x310Logo!;
            break;
    }

    const showName = app.visualElements.defaultTile.showNameOnTiles!.includes(TileSize[tileProps.size]);
    const text = showName ? app.visualElements.displayName : '';
    const fill = `url(#${tileProps.packageName}!${tileProps.appId})`;

    return { image, pack, app, fill, text, textStyle: app.visualElements.foregroundText };
};


export const generateThumbnailPng = async () => {
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

    return png;
}

export default function registerRoutes(router: Router) {
    router.get('/og-image.svg', async (req, res) => {
        const svg = await generateThumbnail();
        res.contentType('image/svg+xml');
        res.send(svg);
    });

    router.get('/og-image.png', async (req, res) => {
        const png = await generateThumbnailPng();
        res.contentType('image/png');
        res.send(png);
    });
}
