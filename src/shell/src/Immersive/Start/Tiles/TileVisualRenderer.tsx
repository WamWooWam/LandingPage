import { ApplicationVisualElements, PackageApplication, TileSize } from "@landing-page/shared";
import { FunctionalComponent, RenderableProps } from "preact";
import { getTileSize } from "./TileUtils";

import PackageImage from "~/Util/PackageImage";
import { memo } from "preact/compat";
import type { TileVisualRendererProps } from "./TileVisualBinding";
import { lazy } from "preact-iso";

const TileVisualBinding = lazy(() => import('./TileVisualBinding'));

export default function TileVisualRenderer({ app, size, binding }: RenderableProps<TileVisualRendererProps>) {
    let visualElements = app.visualElements;

    if (!binding) {
        return <DefaultTileVisual size={size} app={app} visualElements={visualElements} />;
    }

    return <TileVisualBinding app={app} size={size} binding={binding} />;
}

const DefaultTileVisual: FunctionalComponent<{ size: TileSize, app: PackageApplication, visualElements: ApplicationVisualElements }> = memo(({ size, app }) => {
    const tileImageUrl = getTileImageUrl(size, app)!;
    const { width, height } = getTileSize(size);

    return (
        <div class="tile-visual tile-visual-visible">
            <div class="tile-front-image-container">
                <PackageImage url={tileImageUrl}>
                    {image => <img draggable={false} alt={`${app.visualElements.displayName} Icon`} src={image} class={"tile-front-image " + TileSize[size]} />}
                </PackageImage>
            </div>
        </div>
    );
})

function getTileImageUrl(size: TileSize, app: PackageApplication) {
    switch (size) {
        case TileSize.square70x70:
            return app.visualElements.defaultTile.square70x70Logo;
        case TileSize.square150x150:
            return app.visualElements.square150x150Logo;
        case TileSize.wide310x150:
            return app.visualElements.defaultTile.wide310x150Logo;
        case TileSize.square310x310:
            return app.visualElements.defaultTile.square310x310Logo;
    }
}