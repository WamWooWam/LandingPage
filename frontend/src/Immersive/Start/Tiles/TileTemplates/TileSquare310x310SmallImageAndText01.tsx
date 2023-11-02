//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-square310x310-small-image-and-text01.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileNotificationBinding from '../TileNotificationBinding'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileSquare310x310SmallImageAndText01(props: TileTemplateProps) {
    const image1 = props.elements.find(b => b.id === 1 && b.type === 'image');
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    const text2 = props.elements.find(b => b.id === 2 && b.type === 'text');
    const text3 = props.elements.find(b => b.id === 3 && b.type === 'text');
    
    return (
        <TileNotificationBinding className="tile-square310x310-small-image-and-text01" x={0} y={0} width={248} height={248}>
            <div className="images">
                <TileImageBinding className="tile-image-style id-1" binding={image1} />
            </div>
            <div className="headlines">
                <TileTextBinding className="tile-headline-style id-1" binding={text1} />
            </div>
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-2" binding={text2} />
                <TileTextBinding className="tile-body-text-style id-3" binding={text3} />
            </div>
        </TileNotificationBinding>
    );
}
