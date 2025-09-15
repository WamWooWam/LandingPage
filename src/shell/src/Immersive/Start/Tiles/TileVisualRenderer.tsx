import { ApplicationVisualElements, PackageApplication, TileSize } from "@landing-page/shared";
import { FunctionalComponent, JSX, RenderableProps, VNode } from "preact";
import { getTileSize, useTileSize } from "./TileUtils";
import { useEffect, useState } from "preact/hooks";

import PackageImage from "~/Util/PackageImage";
import TileBinding from "~/Data/TileBinding";
import TileTemplateProps from "./TileTemplateProps";
import TileTemplates from "./TileTemplates";
import TileVisual from "~/Data/TileVisual";
import { memo } from "preact/compat";

interface TileVisualRendererProps {
    app: PackageApplication,
    size: TileSize,
    visual?: TileVisual,
    binding?: TileBinding
}

export default function TileVisualRenderer({ app, size, binding }: RenderableProps<TileVisualRendererProps>) {
    let visualElements = app.visualElements;

    if (!binding) {
        return <DefaultTileVisual size={size} app={app} visualElements={visualElements} />;
    }

    return <TileVisualBinding app={app} size={size} binding={binding} />;
}

function TileVisualBinding({ binding }: RenderableProps<TileVisualRendererProps>) {
    const TileTemplate = memo(TileTemplates[binding.template as keyof typeof TileTemplates]);

    return (
        <div class="tile-visual tile-visual-visible">
            {(TileTemplate !== null && binding !== null) && <TileTemplate elements={binding.elements} />}
        </div>
    )
}

const DefaultTileVisual: FunctionalComponent<{ size: TileSize, app: PackageApplication, visualElements: ApplicationVisualElements }> = memo(({ size, app }) => {
    const tileImageUrl = getTileImageUrl(size, app);
    const { width, height } = getTileSize(size);

    return (
        <div class="tile-visual tile-visual-visible">
            <div class="tile-front-image-container">
                <PackageImage url={tileImageUrl}>
                    {image => <img draggable={false} alt={`${app.visualElements.displayName} Icon`} src={image} class={"tile-front-image " + TileSize[size]} width={width} height={height} />}
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