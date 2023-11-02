//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:v8.0.0
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

import "./toasttext01.scss"
import TileTemplateProps from '../TileTemplateProps'
import TileNotificationBinding from '../TileNotificationBinding'
import TileImageBinding from '../TileImageBinding'
import TileTextBinding from '../TileTextBinding'

export default function toasttext01(props: TileTemplateProps) {
    const text1 = props.elements.find(b => b.id === 1 && b.type === 'text');
    
    return (
        <TileNotificationBinding className="toasttext01" dynamicFormat={false} x={0} y={0} width={308} height={72}>
            <div className="images" />
            <div className="text-fields">
                <TileTextBinding className="toast-body-text-style id-1" binding={text1} />
            </div>
        </TileNotificationBinding>
    );
}
