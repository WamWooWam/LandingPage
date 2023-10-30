//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-wide310x150-text05.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileWide310x150Text05(props: TileTemplateProps) {
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    const text2 = props.elements.find(b => b.id === 2 && b.type === 'text');
    const text3 = props.elements.find(b => b.id === 3 && b.type === 'text');
    const text4 = props.elements.find(b => b.id === 4 && b.type === 'text');
    const text5 = props.elements.find(b => b.id === 5 && b.type === 'text');
    
    return (
        <div className="tile-wide310x150-text05">
            <div className="images" />
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-1" binding={text1} />
                <TileTextBinding className="tile-body-text-style id-2" binding={text2} />
                <TileTextBinding className="tile-body-text-style id-3" binding={text3} />
                <TileTextBinding className="tile-body-text-style id-4" binding={text4} />
                <TileTextBinding className="tile-body-text-style id-5" binding={text5} />
            </div>
        </div>
    );
}
