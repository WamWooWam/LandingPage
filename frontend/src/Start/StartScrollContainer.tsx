import { Component, RefObject, createRef } from "preact";
import { useContext } from "preact/hooks";
import { LayoutStateContext } from "../Root";
import { calculateLayout } from "../Tiles/TileUtils";
import TileGroup from "../Tiles/TileGroup";
import LayoutState from "../LayoutState";
import { StartTileGroup } from "shared/StartLayoutParser";

interface StartScrollContainerProps {
    tileGroups: StartTileGroup[];
}

interface StartScrollContainerState {
    observer: ResizeObserver;
    availableHeight: number;
}

export default class StartScrollContainer extends Component<StartScrollContainerProps, StartScrollContainerState> {

    scrollContainer: RefObject<HTMLDivElement>
    startTilesContainer: RefObject<HTMLDivElement>

    constructor(props: StartScrollContainerProps) {
        super(props);
        this.scrollContainer = createRef();
        this.startTilesContainer = createRef();
    }

    componentDidMount() {
        this.scrollContainer.current.addEventListener("wheel", this.onWheel, { passive: true });

        let startTilesContainer = this.startTilesContainer.current;
        if (window.ResizeObserver) {
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
            window.addEventListener("resize", this.onResize.bind(this));
        }
    }

    componentWillUnmount() {
        this.scrollContainer.current.removeEventListener("wheel", this.onWheel);
        if (this.state.observer) {
            this.state.observer.disconnect();
        }
        else {
            window.removeEventListener("resize", this.onResize.bind(this));
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
        let layoutState = useContext(LayoutStateContext);
        let cols = 0;

        let tileGroups = this.props.tileGroups.map(m => {
            let { tiles, columns } = calculateLayout(m.tiles, this.state.availableHeight, cols, layoutState === LayoutState.windowsPhone81);
            cols += columns;
            return { ...m, tiles };
        });

        return (
            <div ref={this.scrollContainer} class="start-tiles-scroll-container" >
                <div ref={this.startTilesContainer} class="start-tiles">
                    {tileGroups.map(m => <TileGroup {...m} />)}
                </div>
            </div>
        );
    }

}