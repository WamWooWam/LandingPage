//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-wide310x150-text04.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileWide310x150Text04(props: TileTemplateProps) {
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    
    return (
        <div className="tile-wide310x150-text04">
            <div className="images" />
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-1" binding={text1} />
            </div>
        </div>
    );
}
