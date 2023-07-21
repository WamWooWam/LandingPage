import { Component, createRef, RefObject, } from "preact";
import { TilePropsWithType } from "./TileUtils";
import TileRenderer, { TileProps } from "./TileRenderer";
import FenceTileRenderer, { FenceTileProps } from "./FenceTileRenderer";
import "./tile.css"

interface TileGroupProps {
    title: string;
    tiles: TilePropsWithType[];
}

export default class TileGroup extends Component<TileGroupProps, {}> {

    constructor(props: TileGroupProps) {
        super(props);
    }

    render() {
        return (
            <div class="start-tile-group">
                <h2 class="tile-group-header">
                    {/* a non breaking space is inserted here to ensure the layout remains the same */}
                    {this.props.title && this.props.title !== "" ? this.props.title : "\u00A0"}
                </h2>
                {...this.props.tiles.map(t => t.type === "fence" ?
                    <FenceTileRenderer key={"Fence_" + t.key} {...t as FenceTileProps} /> :
                    <TileRenderer key={"Tile_" + t.key} {...t as TileProps} />)
                }
            </div>
        )
    }
}