import { Component, createRef, RefObject, } from "preact";
import { TilePropsWithType } from "./TileUtils";
import TileRenderer, { TileProps } from "./TileRenderer";
import FenceTileRenderer, { FenceTileProps } from "./FenceTileRenderer";
import "./tile.scss"
import { useContext } from "preact/hooks";
import { LayoutStateContext } from "../Root";
import LayoutState from "../LayoutState";
import { TileSize } from "shared/TileSize";

interface TileGroupProps {
    title: string;
    tiles: TilePropsWithType[];
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
    return (
        <div class="start-tile-group">
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