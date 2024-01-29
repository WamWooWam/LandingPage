//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./tile-wide310x150-text11.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileNotificationBinding from '../TileNotificationBinding'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function TileWide310x150Text11(props: TileTemplateProps) {
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    const text2 = props.elements.find(b => b.id === 2 && b.type === 'text');
    const text3 = props.elements.find(b => b.id === 3 && b.type === 'text');
    const text4 = props.elements.find(b => b.id === 4 && b.type === 'text');
    const text5 = props.elements.find(b => b.id === 5 && b.type === 'text');
    const text6 = props.elements.find(b => b.id === 6 && b.type === 'text');
    const text7 = props.elements.find(b => b.id === 7 && b.type === 'text');
    const text8 = props.elements.find(b => b.id === 8 && b.type === 'text');
    const text9 = props.elements.find(b => b.id === 9 && b.type === 'text');
    const text10 = props.elements.find(b => b.id === 10 && b.type === 'text');
    
    return (
        <TileNotificationBinding className="tile-wide310x150-text11" forceBadgePlate={false} x={0} y={0} width={248} height={120}>
            <div className="images" />
            <div className="text-fields">
                <TileTextBinding className="tile-body-text-style id-1" binding={text1} />
                <TileTextBinding className="tile-body-text-style id-2" binding={text2} />
                <TileTextBinding className="tile-body-text-style id-3" binding={text3} />
                <TileTextBinding className="tile-body-text-style id-4" binding={text4} />
                <TileTextBinding className="tile-body-text-style id-5" binding={text5} />
                <TileTextBinding className="tile-body-text-style id-6" binding={text6} />
                <TileTextBinding className="tile-body-text-style id-7" binding={text7} />
                <TileTextBinding className="tile-body-text-style id-8" binding={text8} />
                <TileTextBinding className="tile-body-text-style id-9" binding={text9} />
                <TileTextBinding className="tile-body-text-style id-10" binding={text10} />
            </div>
        </TileNotificationBinding>
    );
}
