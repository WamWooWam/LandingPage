import { useLayoutEffect, useRef, useState } from "preact/hooks";
import TileTemplates from "./TileTemplates";
import { useTileSize } from "./TileUtils";
import { RenderableProps } from "preact";
import { PackageApplication, TileSize } from "@landing-page/shared";
import TileVisual from "~/Data/TileVisual";
import TileBinding from "~/Data/TileBinding";

export interface TileVisualRendererProps {
    app: PackageApplication,
    size: TileSize,
    visual?: TileVisual,
    binding?: TileBinding
}

export default function TileVisualBinding({ binding }: RenderableProps<TileVisualRendererProps>) {
    const TileTemplate = TileTemplates[binding!.template as keyof typeof TileTemplates];
    const tileSize = useTileSize();
    const ref = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width: currentWidth } = entry.contentRect;
                const scale = currentWidth / tileSize.width;
                setScale(scale);
            }
        });

        observer.observe(ref.current);

        return () => observer.disconnect();

    }, []);

    return (
        <div ref={ref} class="tile-visual tile-visual-visible" style={{ transform: `scale(${scale})`, transformOrigin: scale > 1 ? 'top center' : 'top left' }}>
            {(TileTemplate !== null && binding !== null) && <TileTemplate elements={binding!.elements} />}
        </div>
    )
}