import { PackageApplication } from "shared/PackageApplication";
import { TileSize } from "shared/TileSize";
import { RenderableProps } from "preact";
import TileBinding from "./TileBinding";
import TileVisual from "./TileVisual";
import { fixupUrl } from "../Util";
import { getTileSize } from "./TileUtils";

interface TileVisualRendererProps {
    app: PackageApplication,
    size: TileSize,
    visual: TileVisual
}

const TileTemplateMap: Map<string, Function>
    = new Map([
        ["TileWide310x150SmallImageAndText", TileWide310x150SmallImageAndText],
        ["TileWide310x150PeekImage", TileWide310x150PeekImage],
        ["TileWide310x150HeaderAndText", TileWide310x150HeaderAndText],
        ["TileSquare150x150PeekImage", TileSquare150x150PeekImage],
        ["TileSquare150x150Text", TileSquare150x150Text],
        ["TileSquare150x150HeaderAndText", TileSquare150x150HeaderAndText],
        ["TileSquare310x310ImageAndTextOverlay02", TileSquare310x310ImageAndTextOverlay02]
    ]);

export default function TileVisualRenderer({ app, size, visual }: RenderableProps<TileVisualRendererProps>) {
    let hasWebP = true;
    let visualElements = app.visualElements;

    if (!visual || !visual.bindings || visual.bindings.length == 0) {
        let tileImageUrl = fixupUrl(getTileImageUrl(size, app), hasWebP);
        let showTextSizes = visualElements.defaultTile.showNameOnTiles.map(v => TileSize[v as keyof typeof TileSize]);

        let tileVisualText = null;
        if (size != TileSize.square70x70 && showTextSizes.includes(size)) {
            tileVisualText = <p class={"tile-front-text" + (visualElements.foregroundText == "dark" ? " black" : "")}>{visualElements.displayName}</p>
        }

        const { width, height } = getTileSize(size);

        return (
            <div class="tile-visual tile-visual-visible">
                <div class="tile-front-image-container">
                    <img draggable={false} alt={`${app.visualElements.displayName} Icon`} src={tileImageUrl} class={"tile-front-image " + TileSize[size]} width={width} height={height} />
                </div>
                {tileVisualText}
            </div>
        )
    }

    let binding = visual.bindings.find(v => v.size === size);
    if (!binding) {
        console.error(`No binding found for size ${size}`);
        return null;
    }

    const TileTemplate = TileTemplateMap.get(binding.template);
    if (!TileTemplate) {
        console.error(`Unknown tile template ${binding.template}`);
        return null;
    }
    return (
        <div class="tile-visual tile-visual-visible">
            {TileTemplate({ app, size, visual }, binding)}
        </div>
    )
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

function TileWide310x150SmallImageAndText(props: TileVisualRendererProps, binding: TileBinding) {
    let text = binding.elements.find(f => f.type == "text" && f.id == binding.id);
    let image = binding.elements.find(f => f.type == "image" && f.id == binding.id);

    return (
        <div className="tile-binding tile-wide-small-image-and-text">
            <img src={image.content} alt={image.alt} width={64} height={64} />
            <p>{text.content ?? '\u00A0'}</p>
        </div>
    )
}

function TileWide310x150PeekImage(props: TileVisualRendererProps, binding: TileBinding) {
    let image = binding.elements.find(f => f.type == "image" && f.id == binding.id);

    return (
        <div className="tile-binding tile-wide-peak-image"
            style={{ backgroundImage: `url(${image.content})` }}
            role="img"
            aria-label={image.alt} />
    )
}

function TileSquare150x150PeekImage(props: TileVisualRendererProps, binding: TileBinding) {
    let text = binding.elements.find(f => f.type == "text" && f.id == binding.id);
    let image = binding.elements.find(f => f.type == "image" && f.id == binding.id);

    return (
        <div className="tile-binding tile-wide-peak-image"
            style={{ backgroundImage: `url(${image.content})` }}
            role="img"
            aria-label={image.alt} />)
}

function TileSquare150x150Text(props: TileVisualRendererProps, binding: TileBinding) {
    let text = binding.elements.find(f => f.type == "text");

    return (
        <div className="tile-binding tile-square-text">
            <p>{text.content ?? '\u00A0'}</p>
        </div>
    )
}

function TileSquare150x150HeaderAndText(props: TileVisualRendererProps, binding: TileBinding) {
    let text1 = binding.elements.find(f => f.type == "text" && f.id == 1);
    let text2 = binding.elements.find(f => f.type == "text" && f.id == 2);

    return (
        <div className="tile-binding tile-square-header-and-text">
            <h3>{text1.content ?? '\u00A0'}</h3>
            <p>{text2.content ?? '\u00A0'}</p>
        </div>
    )
}

function TileWide310x150HeaderAndText(props: TileVisualRendererProps, binding: TileBinding) {
    let text1 = binding.elements.find(f => f.type == "text" && f.id == 1);
    let text2 = binding.elements.find(f => f.type == "text" && f.id == 2);

    return (
        <div className="tile-binding tile-wide-header-and-text">
            <h3>{text1.content ?? '\u00A0'}</h3>
            <p>{text2.content ?? '\u00A0'}</p>
        </div>
    )
}

function TileSquare310x310ImageAndTextOverlay02(props: TileVisualRendererProps, binding: TileBinding) {
    let text1 = binding.elements.find(f => f.type == "text" && f.id == 1);
    let text2 = binding.elements.find(f => f.type == "text" && f.id == 2);
    let image = binding.elements.find(f => f.type == "image" && f.id == 1);

    return (
        <div className="tile-binding tile-square-image-and-text-overlay-02"
            style={{ backgroundImage: `url(${image.content})` }}
            aria-label={image.alt}>
            <h3>{text1.content ?? '\u00A0'}</h3>
            <p>{text2.content ?? '\u00A0'}</p>
        </div>
    )
}