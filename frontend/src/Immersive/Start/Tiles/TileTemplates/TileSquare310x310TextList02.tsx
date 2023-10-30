//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-square310x310-text-list02.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileSquare310x310TextList02(props: TileTemplateProps) {
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    const text2 = props.elements.find(b => b.id === 2 && b.type === 'text');
    const text3 = props.elements.find(b => b.id === 3 && b.type === 'text');
    
    return (
        <div className="tile-square310x310-text-list02">
            <div className="images" />
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-1" binding={text1} />
                <TileTextBinding className="tile-body-text-style id-2" binding={text2} />
                <TileTextBinding className="tile-body-text-style id-3" binding={text3} />
            </div>
        </div>
    );
}
