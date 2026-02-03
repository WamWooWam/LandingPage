import "./tile.scss"

import type { FenceTileProps } from "./FenceTileRenderer";
import type { TileProps } from "./TileRenderer";

import { TilePropsWithType } from "./TileUtils";
import { ErrorBoundary, lazy } from "preact-iso";

const TileRenderer = lazy(() => import('./TileRenderer'));
const FenceTileRenderer = lazy(() => import('./FenceTileRenderer'));

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
                            {column.map((tile, idx) => (tile.type === "fence" ? <FenceTileRenderer key={tile.key} style={{ '--idx': tile.animColumn, '--offset': idx + props.baseOffset } as any} {...tile as FenceTileProps} /> :
                                <TileRenderer key={tile.key} style={{ '--idx': tile.animColumn, '--offset': idx + props.baseOffset } as any} {...tile as TileProps} />
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}