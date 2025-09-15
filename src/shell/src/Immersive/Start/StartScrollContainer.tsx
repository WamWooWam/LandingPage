import { useLayoutEffect, useRef, useState } from "preact/hooks";

import { StartTileGroup } from "@landing-page/shared";
import TileGroup from "./Tiles/TileGroup";
import { calculateLayout } from "./Tiles/TileUtils";

interface StartScrollContainerProps {
    tileGroups: StartTileGroup[];
}

export default function StartScrollContainer({ tileGroups }: StartScrollContainerProps) {
    const startTilesContainer = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(-1);

    useLayoutEffect(() => {
        // TODO: figure out if i need this fallback in the big 25
        if (typeof ResizeObserver !== "undefined") {
            const onResize = (entries: ResizeObserverEntry[]) => {
                for (const entry of entries) {
                    if (entry.target !== startTilesContainer.current)
                        continue;

                    setHeight(entry.contentRect.height - 32);
                }
            };

            const resizeObserver = new ResizeObserver(onResize);
            resizeObserver.observe(startTilesContainer.current);
            return () => resizeObserver.disconnect();
        }

        // fallback to window resize event
        const onResize = () => {
            if (!startTilesContainer.current) {
                return;
            }

            const rect = startTilesContainer.current.getBoundingClientRect();
            setHeight(rect.height - 32);
        };

        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const onWheel = (e: WheelEvent) => {
        // make sure this isn't a horizontal scroll
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            return;
        }

        // invert the deltas so that scrolling vertically scrolls horizontally
        const deltaX = e.deltaY;
        // const deltaY = e.deltaX;

        const scrollContainer = e.currentTarget as HTMLElement;
        const scrollLeft = scrollContainer.scrollLeft;
        const scrollWidth = scrollContainer.scrollWidth;
        const scrollLeftNew = Math.max(0, Math.min(scrollWidth - scrollContainer.clientWidth, scrollLeft + deltaX));
        scrollContainer.scrollTo({ left: scrollLeftNew, behavior: "auto" });
    };

    const tileGroupsLayout = tileGroups.reduce((arr, group, idx) => {
        let { tileColumns } = calculateLayout(group.tiles, height, false);
        arr.push({ ...group, tileColumns, baseColumn: idx === 0 ? 0 : arr[idx - 1].baseColumn + arr[idx - 1].tileColumns.length });
        return arr;
    }, []);

    const maxRows = (Math.floor(height / 128) * 128) + 30;

    return (
        <div class="start-tiles-scroll-container" onWheel={onWheel}>
            <div ref={startTilesContainer} class="start-tiles" style={{ visibility: "visible" }}>
                {tileGroupsLayout.map(m => <TileGroup {...m} height={maxRows} />)}
            </div>
        </div>
    )
}