export default interface TileElement {
    id: number;
    type: 'image' | 'text';
    content: string;
    alt: string;
}
