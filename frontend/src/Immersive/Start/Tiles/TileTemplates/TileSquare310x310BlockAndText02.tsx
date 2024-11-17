//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import './tile-square310x310-block-and-text02.scss';
import TileTemplateProps from '../TileTemplateProps';
import TileNotificationBinding from '../TileNotificationBinding';
import TileImageBinding from '../TileImageBinding';
import TileTextBinding from '../TileTextBinding';

export default function TileSquare310x310BlockAndText02(
    props: TileTemplateProps,
) {
    const image1 = props.elements.find((b) => b.id === 1 && b.type === 'image');
    const text2 = props.elements.find((b) => b.id === 2 && b.type === 'text');
    const text3 = props.elements.find((b) => b.id === 3 && b.type === 'text');
    const text4 = props.elements.find((b) => b.id === 4 && b.type === 'text');
    const text5 = props.elements.find((b) => b.id === 5 && b.type === 'text');
    const text6 = props.elements.find((b) => b.id === 6 && b.type === 'text');
    const text7 = props.elements.find((b) => b.id === 7 && b.type === 'text');
    const text1 = props.elements.find((b) => b.id === 1 && b.type === 'text');

    return (
        <TileNotificationBinding
            className="tile-square310x310-block-and-text02"
            forceBadgePlate={true}
            dynamicFormat={false}
            x={0}
            y={0}
            width={248}
            height={248}>
            <div className="images">
                <TileImageBinding
                    className="tile-image-style id-1"
                    binding={image1}
                />
            </div>
            <div className="tile-image-overlay-style image-overlay" />
            <div className="headlines">
                <TileTextBinding
                    className="tile-headline-style id-2"
                    binding={text2}
                />
                <TileTextBinding
                    className="tile-headline-style id-3"
                    binding={text3}
                />
            </div>
            <div className="text-fields">
                <TileTextBinding
                    className="tile-body-text-style id-4"
                    binding={text4}
                />
                <TileTextBinding
                    className="tile-body-text-style id-5"
                    binding={text5}
                />
                <TileTextBinding
                    className="tile-body-text-style id-6"
                    binding={text6}
                />
                <TileTextBinding
                    className="tile-body-text-style id-7"
                    binding={text7}
                />
            </div>
            <div className="block-text-fields">
                <TileTextBinding
                    className="tile-block-text-style id-1"
                    binding={text1}
                />
            </div>
        </TileNotificationBinding>
    );
}