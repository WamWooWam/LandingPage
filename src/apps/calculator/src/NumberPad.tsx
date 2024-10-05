import { Component } from "preact";
import { CalculatorButton } from "./CalculatorButton";
import { useContext } from "preact/hooks";
import { ViewModelContext } from "./MainPage";

export default function NumberPad() {
    const model = useContext(ViewModelContext);

    return (
        <div class="calc-numbers">
            <CalculatorButton ButtonId="Seven" Content="7" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Eight" Content="8" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Nine" Content="9" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Four" Content="4" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Five" Content="5" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Six" Content="6" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="One" Content="1" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Two" Content="2" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Three" Content="3" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Zero" Content="0" Click={model.onButtonClicked} />
            <CalculatorButton ButtonId="Decimal" Content="." Click={model.onButtonClicked} />
        </div>
    )
}
