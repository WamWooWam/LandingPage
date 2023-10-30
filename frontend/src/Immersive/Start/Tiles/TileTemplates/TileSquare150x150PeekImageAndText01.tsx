//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-square150x150-peek-image-and-text01.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileSquare150x150PeekImageAndText01(props: TileTemplateProps) {
    const image1 = props.elements.find(b => b.id === 1 && b.type === 'image');
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    const text2 = props.elements.find(b => b.id === 2 && b.type === 'text');
    const text3 = props.elements.find(b => b.id === 3 && b.type === 'text');
    const text4 = props.elements.find(b => b.id === 4 && b.type === 'text');
    
    return (
        <div className="tile-square150x150-peek-image-and-text01">
            <div className="images">
                <TileImageBinding className="tile-image-style id-1" binding={image1} />
            </div>
            <div className="headlines">
                <TileTextBinding className="tile-headline-style id-1" binding={text1} />
            </div>
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-2" binding={text2} />
                <TileTextBinding className="tile-body-text-style id-3" binding={text3} />
                <TileTextBinding className="tile-body-text-style id-4" binding={text4} />
            </div>
        </div>
    );
}
