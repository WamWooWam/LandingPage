import "./tile.scss"

import FenceTileRenderer, { FenceTileProps } from "./FenceTileRenderer";
import TileRenderer, { TileProps } from "./TileRenderer";

import { TilePropsWithType } from "./TileUtils";

interface TileGroupProps {
    title: string;
    tiles: TilePropsWithType[];
    columns?: number;
}

// TODO: this implements the tile entry animation for mobile devices, need to find a better place for this
// if (isMobile) {
//     let tilesPerRow = 3;
//     let tileWidth = (window.innerWidth - 32) / 3;
//     if (window.innerWidth < 400) {
//         tilesPerRow = 2;
//         tileWidth = (window.innerWidth - 80) / 2;
//     }


//     for (let i = tiles.length - 1; i >= 0; i--) {
//         let tile = tiles[i];
//         let width = tileWidth;
//         if (tile.size === TileSize.wide310x150)
//             width = tileWidth * 2 + 8;

//         let style: Partial<CSSStyleDeclaration> = {
//             transformOrigin: -(i % tilesPerRow) * (width) - 24 + "px",
//             transform: "translate3d(0,0,0) rotateY(0)",
//             transitionDelay: (tiles.length - i) * 40 + "ms",
//             opacity: "1"
//         }

//         if (!this.state.isLoaded) {
//             style.transform = "translate3d(-96px,0, -96px) rotateY(90deg)";
//             style.transitionDelay = "0ms";
//             style.opacity = "0";
//         }

//         tile.style = style;
//     }

//     if (!this.state.isLoaded) {
//         setTimeout(() => {
//             this.setState({ isLoaded: true });
//         }, tiles.length * 40 + 100);
//     }
// }

export default function TileGroup(props: TileGroupProps) {
    let style = {};
    // BUGBUG: fix for a webkit bug where the container size is not calculated correctly
    if (props.columns !== undefined) {
        style = {
            gridTemplateColumns: "repeat(" + props.columns + ", 120px)"
        }
    }

    return (
        <div class="start-tile-group" style={style}>
            <h2 class="tile-group-header">
                {/* a non breaking space is inserted here to ensure the layout remains the same */}
                {this.props.title && this.props.title !== "" ? this.props.title : "\u00A0"}
            </h2>
            {...props.tiles.map(t => t.type === "fence" ?
                <FenceTileRenderer key={"Fence_" + t.key} {...t as FenceTileProps} /> :
                <TileRenderer key={"Tile_" + t.key} {...t as TileProps} />)
            }
        </div>
    )
}