import { FunctionalComponent, JSX, RenderableProps, VNode } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { ApplicationVisualElements } from 'shared/ApplicationVisualElements';
import { PackageApplication } from 'shared/PackageApplication';
import PackageImage from '~/Util/PackageImage';
import TileBinding from '~/Data/TileBinding';
import { TileSize } from 'shared/TileSize';
import TileTemplateProps from './TileTemplateProps';
import TileTemplates from './TileTemplates';
import TileVisual from '~/Data/TileVisual';
import { getTileSize } from './TileUtils';

interface TileVisualRendererProps {
    app: PackageApplication;
    size: TileSize;
    visual?: TileVisual;
    binding?: TileBinding;
}

export default function TileVisualRenderer({
    app,
    size,
    binding,
}: RenderableProps<TileVisualRendererProps>) {
    let visualElements = app.visualElements;

    if (!binding) {
        return (
            <DefaultTileVisual
                size={size}
                app={app}
                visualElements={visualElements}
            />
        );
    }

    return <TileVisualBinding app={app} size={size} binding={binding} />;
}

async function LoadTileTemplate(binding: TileBinding) {
    try {
        return await TileTemplates[
            binding.template as keyof typeof TileTemplates
        ]();
    } catch (e) {
        console.error(`Failed to load ${binding.template}`, binding);
        try {
            return await TileTemplates[
                binding.fallback as keyof typeof TileTemplates
            ]();
        } catch (e) {
            console.error(`Failed to load ${binding.fallback}`, binding);
            return null;
        }
    }
}

function TileVisualBinding({
    binding,
}: RenderableProps<TileVisualRendererProps>) {
    const [TileTemplate, setTileTemplate] =
        useState<FunctionalComponent<TileTemplateProps>>(null);
    useEffect(() => {
        LoadTileTemplate(binding).then((template) =>
            setTileTemplate(() => template),
        );

        return () => setTileTemplate(null);
    }, [binding]);

    return (
        <div class="tile-visual tile-visual-visible">
            {TileTemplate !== null && binding !== null && (
                <TileTemplate elements={binding.elements} />
            )}
        </div>
    );
}

function DefaultTileVisual({
    size,
    app,
    visualElements,
}: {
    size: TileSize;
    app: PackageApplication;
    visualElements: ApplicationVisualElements;
}) {
    let tileImageUrl = getTileImageUrl(size, app);

    const { width, height } = getTileSize(size);

    return (
        <div class="tile-visual tile-visual-visible">
            <div class="tile-front-image-container">
                <PackageImage url={tileImageUrl}>
                    {(image) => (
                        <img
                            draggable={false}
                            alt={`${app.visualElements.displayName} Icon`}
                            src={image}
                            class={'tile-front-image ' + TileSize[size]}
                            width={width}
                            height={height}
                        />
                    )}
                </PackageImage>
            </div>
        </div>
    );
}

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

function TileWide310x150SmallImageAndText(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let text = binding.elements.find(
        (f) => f.type == 'text' && f.id == binding.id,
    );
    let image = binding.elements.find(
        (f) => f.type == 'image' && f.id == binding.id,
    );

    return (
        <div className="tile-binding tile-wide-small-image-and-text">
            <img src={image.content} alt={image.alt} width={64} height={64} />
            <p>{text.content ?? '\u00A0'}</p>
        </div>
    );
}

function TileWide310x150PeekImage(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let image = binding.elements.find(
        (f) => f.type == 'image' && f.id == binding.id,
    );

    return (
        <div
            className="tile-binding tile-wide-peak-image"
            style={{ backgroundImage: `url(${image.content})` }}
            role="img"
            aria-label={image.alt}
        />
    );
}

function TileSquare150x150PeekImage(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let text = binding.elements.find(
        (f) => f.type == 'text' && f.id == binding.id,
    );
    let image = binding.elements.find(
        (f) => f.type == 'image' && f.id == binding.id,
    );

    return (
        <div
            className="tile-binding tile-wide-peak-image"
            style={{ backgroundImage: `url(${image.content})` }}
            role="img"
            aria-label={image.alt}
        />
    );
}

function TileSquare150x150Text(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let text = binding.elements.find((f) => f.type == 'text');

    return (
        <div className="tile-binding tile-square-text">
            <p>{text.content ?? '\u00A0'}</p>
        </div>
    );
}

function TileSquare150x150HeaderAndText(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let text1 = binding.elements.find((f) => f.type == 'text' && f.id == 1);
    let text2 = binding.elements.find((f) => f.type == 'text' && f.id == 2);

    return (
        <div className="tile-binding tile-square-header-and-text">
            <h3>{text1.content ?? '\u00A0'}</h3>
            <p>{text2.content ?? '\u00A0'}</p>
        </div>
    );
}

function TileWide310x150HeaderAndText(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let text1 = binding.elements.find((f) => f.type == 'text' && f.id == 1);
    let text2 = binding.elements.find((f) => f.type == 'text' && f.id == 2);

    return (
        <div className="tile-binding tile-wide-header-and-text">
            <h3>{text1.content ?? '\u00A0'}</h3>
            <p>{text2.content ?? '\u00A0'}</p>
        </div>
    );
}

function TileSquare310x310ImageAndTextOverlay02(
    props: TileVisualRendererProps,
    binding: TileBinding,
) {
    let text1 = binding.elements.find((f) => f.type == 'text' && f.id == 1);
    let text2 = binding.elements.find((f) => f.type == 'text' && f.id == 2);
    let image = binding.elements.find((f) => f.type == 'image' && f.id == 1);

    return (
        <div
            className="tile-binding tile-square-image-and-text-overlay-02"
            style={{ backgroundImage: `url(${image.content})` }}
            aria-label={image.alt}>
            <h3>{text1.content ?? '\u00A0'}</h3>
            <p>{text2.content ?? '\u00A0'}</p>
        </div>
    );
}
