import { Component, RefObject, createRef } from "preact";

import { StartTileGroup } from "shared/StartLayoutParser";
import TileGroup from "./Tiles/TileGroup";
import { calculateLayout } from "./Tiles/TileUtils";
import { useContext } from "preact/hooks";

interface StartScrollContainerProps {
    tileGroups: StartTileGroup[];
}

interface StartScrollContainerState {
    observer: ResizeObserver;
    availableHeight: number;
    visible: boolean;
}

export default class StartScrollContainer extends Component<StartScrollContainerProps, StartScrollContainerState> {

    scrollContainer: RefObject<HTMLDivElement>
    startTilesContainer: RefObject<HTMLDivElement>

    constructor(props: StartScrollContainerProps) {
        super(props);
        this.scrollContainer = createRef();
        this.startTilesContainer = createRef();

        this.onResize = this.onResize.bind(this);
    }

    componentDidMount() {
        this.setState({ visible: true });

        this.scrollContainer.current.addEventListener("wheel", this.onWheel, { passive: true });
        let startTilesContainer = this.startTilesContainer.current;
        if (typeof ResizeObserver !== "undefined") {
            let resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === startTilesContainer) {
                        this.setHeight(entry.contentRect.height);
                    }
                }
            });

            resizeObserver.observe(startTilesContainer);
            this.setState({ observer: resizeObserver });
        }
        else {
            // fallback to window resize event
            window.addEventListener("resize", this.onResize);
        }

        this.setHeight();
    }

    componentWillUnmount() {
        this.scrollContainer.current.removeEventListener("wheel", this.onWheel);
        if (this.state.observer) {
            this.state.observer.disconnect();
        }
        else {
            window.removeEventListener("resize", this.onResize);
        }
    }

    onResize() {
        this.setHeight();
    }

    setHeight(num: number = undefined) {
        if (num !== undefined) {
            let availableHeight = num - 32;
            this.setState({ availableHeight });
        }
        else {
            let startTilesElement = this.startTilesContainer.current;
            let availableHeight = startTilesElement.getBoundingClientRect().height - 32;
            this.setState({ availableHeight });
        }
    }

    onWheel(e: WheelEvent) {
        // make sure this isn't a horizontal scroll
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            return;
        }

        // invert the deltas so that scrolling vertically scrolls horizontally
        const deltaX = e.deltaY;
        const deltaY = e.deltaX;

        const scrollContainer = e.currentTarget as HTMLElement;
        const scrollLeft = scrollContainer.scrollLeft;
        const scrollWidth = scrollContainer.scrollWidth;
        const scrollLeftNew = Math.max(0, Math.min(scrollWidth - scrollContainer.clientWidth, scrollLeft + deltaX));
        scrollContainer.scrollTo({ left: scrollLeftNew, behavior: "auto" });
    }

    render() {
        let cols = 0;
        // BUGBUG: this is horrible
        let tileGroups = this.props.tileGroups.map(m => {
            let colBase = cols;
            let { tileColumns } = calculateLayout(m.tiles, this.state.availableHeight, false);
            cols += tileColumns.length;
            return { ...m, tileColumns, baseColumn: colBase };
        });

        const maxRows = (Math.floor(this.state.availableHeight / 128) * 128) + 30;

        return (
            <div ref={this.scrollContainer} class="start-tiles-scroll-container" >
                <div ref={this.startTilesContainer} class="start-tiles" style={{ visibility: this.state.visible ? "visible" : "hidden" }}>
                    {tileGroups.map(m => <TileGroup {...m} height={maxRows} />)}
                </div>
            </div>
        );
    }

}