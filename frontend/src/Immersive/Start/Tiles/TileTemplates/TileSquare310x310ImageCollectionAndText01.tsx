//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-square310x310-image-collection-and-text01.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileNotificationBinding from '../TileNotificationBinding'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileSquare310x310ImageCollectionAndText01(props: TileTemplateProps) {
    const image1 = props.elements.find(b => b.id === 1 && b.type === 'image');
    const image2 = props.elements.find(b => b.id === 2 && b.type === 'image');
    const image3 = props.elements.find(b => b.id === 3 && b.type === 'image');
    const image4 = props.elements.find(b => b.id === 4 && b.type === 'image');
    const image5 = props.elements.find(b => b.id === 5 && b.type === 'image');
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    
    return (
        <TileNotificationBinding className="tile-square310x310-image-collection-and-text01" forceBadgePlate={true} dynamicFormat={false} logoMargins={{left: 48, top: 208, right: 232, bottom: 244}} badgeMargins={{left: 16, top: 208, right: 212, bottom: 244}} logoAndBadgeMargins={{left: 48, top: 208, right: 212, bottom: 244}} singleLineYOffset="8px">
            <div className="images">
                <TileImageBinding className="tile-image-style id-1" binding={image1} />
                <TileImageBinding className="tile-small-image-bottom-and-right-edge-style id-2" binding={image2} />
                <TileImageBinding className="tile-small-image-bottom-and-right-edge-style id-3" binding={image3} />
                <TileImageBinding className="tile-small-image-bottom-and-right-edge-style id-4" binding={image4} />
                <TileImageBinding className="tile-small-image-bottom-edge-style id-5" binding={image5} />
            </div>
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-1" binding={text1} />
            </div>
        </TileNotificationBinding>
    );
}
