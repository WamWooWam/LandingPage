import "./tile.scss"

import FenceTileRenderer, { FenceTileProps } from "./FenceTileRenderer";
import TileRenderer, { TileProps } from "./TileRenderer";

import { TilePropsWithType } from "./TileUtils";

export interface TileGroupProps {
    title: string;
    height?: number;
    baseColumn: number;
    baseOffset: number;
    tileColumns: TilePropsWithType[][];
}


export default function TileGroup(props: TileGroupProps) {
    let style = { height: props.height + "px" };

    return (
        <div class="start-tile-group" style={style}>
            <h2 class="tile-group-header">
                {/* a non breaking space is inserted here to ensure the layout remains the same */}
                {this.props.title && this.props.title !== "" ? this.props.title : "\u00A0"}
            </h2>
            <div class="tile-group-content">
                {props.tileColumns.map((column, idx) => {
                    return (
                        <div class="tile-column" key={idx} style={{ '--column': (props.baseColumn + idx).toString() }}>
                            {column.map((tile, idx) => {
                                if (tile.type === "fence") {
                                    return <FenceTileRenderer key={tile.key} style={{ '--idx': tile.animColumn, '--offset': idx + props.baseOffset } as any} {...tile as FenceTileProps} />
                                }
                                else {
                                    return <TileRenderer key={tile.key} style={{ '--idx': tile.animColumn, '--offset': idx + props.baseOffset } as any} {...tile as TileProps} />
                                }
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}