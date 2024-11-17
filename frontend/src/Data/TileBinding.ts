import TileElement from './TileElement';
import { TileSize } from 'shared/TileSize';

export default interface TileBinding {
    id: number;
    size: TileSize;
    template: string;
    fallback: string;
    elements: TileElement[];
}
