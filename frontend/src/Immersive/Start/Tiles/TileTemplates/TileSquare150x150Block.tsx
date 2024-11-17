//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import './tile-square150x150-block.scss';
import TileTemplateProps from '../TileTemplateProps';
import TileNotificationBinding from '../TileNotificationBinding';
import TileImageBinding from '../TileImageBinding';
import TileTextBinding from '../TileTextBinding';

export default function TileSquare150x150Block(props: TileTemplateProps) {
    const text1 = props.elements.find((b) => b.id === 1 && b.type === 'text');
    const text2 = props.elements.find((b) => b.id === 2 && b.type === 'text');

    return (
        <TileNotificationBinding
            className="tile-square150x150-block"
            forceBadgePlate={true}
            dynamicFormat={false}
            x={0}
            y={0}
            width={120}
            height={120}>
            <div className="images" />
            <div className="block-text-fields">
                <TileTextBinding
                    className="tile-block-text-style id-1"
                    binding={text1}
                />
            </div>
            <div className="text-fields">
                <TileTextBinding
                    className="tile-body-text-style id-2"
                    binding={text2}
                />
            </div>
        </TileNotificationBinding>
    );
}
