//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./desktop-tile-square70x70-image.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileNotificationBinding from '../TileNotificationBinding'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function DesktopTileSquare70x70Image(props: TileTemplateProps) {
    const image1 = props.elements.find(b => b.id === 1 && b.type === 'image');
    
    return (
        <TileNotificationBinding className="desktop-tile-square70x70-image" forceBadgePlate={true} dynamicFormat={false}>
            <div className="images">
                <TileImageBinding className="tile-image-style id-1" binding={image1} />
            </div>
        </TileNotificationBinding>
    );
}
