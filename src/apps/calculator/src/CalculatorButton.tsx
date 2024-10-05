import { ConvertMarginToStyle } from "./Utils";

type CalculatorButtonProps = {
    ButtonId: string;
    Content: string;
    Width?: number;
    Height?: number;
    FontSize?: number;
    IsEnabled?: boolean;
    Margin?: string;
    Padding?: string;
    FontWeight?: string;
    FontFamily?: string;

    Click?: (buttonId: string) => void;
};

export function CalculatorButton(props: CalculatorButtonProps) {
    const style = {
        width: props.Width,
        height: props.Height,
        fontSize: props.FontSize,
        margin: ConvertMarginToStyle(props.Margin),
        fontWeight: props.FontWeight,
        fontFamily: props.FontFamily
    };

    return (
        <button class={`calc-button calc-button-${props.ButtonId.toLowerCase()}`} 
                width={props.Width} 
                height={props.Height}
                style={style} 
                onClick={() => props.Click && props.Click(props.ButtonId)}>
            <div class="calc-button-content" style={{ margin: ConvertMarginToStyle(props.Padding) }}>
                {props.Content}
            </div>
        </button>
    );
}
