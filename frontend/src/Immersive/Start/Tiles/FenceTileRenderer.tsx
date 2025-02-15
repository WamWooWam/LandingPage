import './tile.scss';

import TileRenderer, { TileProps } from './TileRenderer';

export interface FenceTileProps {
    apps: TileProps[];
    row?: number;
    column?: number;
    animColumn?: number;
    style?: Partial<CSSStyleDeclaration>;
}

export default function FenceTileRenderer(props: FenceTileProps) {
    let style: any = {
        'grid-row-start': props.row ? (props.row + 1).toString() : undefined,
        'grid-column-start': props.column
            ? (props.column + 1).toString()
            : undefined,
        ...(props.style ?? {}),
    };

    return (
        <div class="fence-tile-container square150x150" style={style}>
            {...props.apps.map((a) => (
                <TileRenderer key={`Tile_${a.packageName}!${a.appId}`} {...a} />
            ))}
        </div>
    );
}
