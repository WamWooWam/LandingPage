import { Component, RefObject, createRef } from "preact";
import { useContext } from "preact/hooks";
import { ScrollStateContext } from "./ScrollStateProvider";
const WallpaperSize = 3840;

export interface TileBackgroundProps {

}

export interface TileeBackgroundState {
    tileX: number;
    tileY: number;
    height: number;
}

export class TileBackgroundRenderer extends Component<TileBackgroundProps, TileeBackgroundState> {

    element: RefObject<HTMLDivElement>;

    constructor(props: TileBackgroundProps) {
        super(props);

        this.element = createRef();
    }

    componentDidMount(): void {
        let bounds = this.element.current.getBoundingClientRect();
        let height = bounds.height;
        let y = bounds.top + window.scrollY;
        let x = bounds.left + window.scrollX;

        this.setState({ height, tileX: x, tileY: y });
    }

    render(props: TileBackgroundProps) {
        let { height, tileX: x, tileY: y } = this.state;        
        let { totalWidth, totalHeight, scrollHeight } = useContext(ScrollStateContext);
        
        let wallpaperSize = Math.max(totalWidth, totalHeight) * 1.5;
        let wallpaperOriginX = (wallpaperSize - totalWidth) / 2;
        let wallpaperOriginY = 0;

        let wallpaperX = (wallpaperOriginX) + (x);
        let wallpaperY = scrollHeight + y;

        let style = {
            backgroundPosition: `${(wallpaperX / wallpaperSize) * 100}% ${(wallpaperY / wallpaperSize) * 100}%`,
            backgroundSize: `${wallpaperSize}px ${wallpaperSize}px`
        }      
        
        return (
            <div ref={this.element} class="tile-background" style={style}></div>
        )
    }
}