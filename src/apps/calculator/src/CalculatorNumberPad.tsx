import { Component } from "preact";
import { CalculatorButton } from "./CalculatorButton";
import { useContext } from "preact/hooks";
import { ViewModelContext } from "./MainPage";
import NumberPad from "./NumberPad";

export default function CalculatorNumberPad() {
    const model = useContext(ViewModelContext);

    return (
        <div class="calc-pad">
            <NumberPad />
            <CalculatorButton ButtonId="ClearEntry" Content="CE" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Clear" Content="C" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Backspace" Content="&#xE083;" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Divide" Content="÷" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Multiply" Content="×" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Subtract" Content="-" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Add" Content="+" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Equals" Content="=" Click={model.onButtonClicked} />
        </div>
    )
}