import { Component } from "preact";
import { TileRenderer, TileProps } from "./TileRenderer";
import "./tile.css"

export interface FenceTileProps {
    apps: TileProps[]
    row?: number,
    column?: number;
}

export class FenceTileRenderer extends Component<FenceTileProps> {

    constructor(props: FenceTileProps) {
        super(props);
    }

    render(props: FenceTileProps) {
        let style = {
            gridRowStart: props.row ? props.row + 2 : undefined,
            gridColumnStart: props.column ? props.column + 1 : undefined
        }

        return (
            <div class="fence-tile-container square150x150" style={style}>
                {...props.apps.map(a => <TileRenderer key={`Tile_${a.packageName}!${a.appId}`} {...a} />)}
            </div>
        )
    }
}