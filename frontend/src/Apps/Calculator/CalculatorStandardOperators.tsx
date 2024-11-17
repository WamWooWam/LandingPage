import { Component } from 'preact';
import { CalculatorButton } from './CalculatorButton';
import { useContext } from 'preact/hooks';
import { ViewModelContext } from './MainPage';

export default function CalculatorStandardOperators() {
    const model = useContext(ViewModelContext);

    return (
        <div class="calc-standard-buttons">
            <CalculatorButton ButtonId="Memory" Content="M" />
            <CalculatorButton
                ButtonId="Negate"
                Content="&#x00B1;"
                Click={model.onButtonClicked}
            />
            <CalculatorButton
                ButtonId="Sqrt"
                Content="&#x221A;"
                Click={model.onButtonClicked}
            />
            <CalculatorButton
                ButtonId="Percent"
                Content="%"
                IsEnabled={true}
                Click={model.onButtonClicked}
            />
            <CalculatorButton
                ButtonId="Invert"
                Content="1/𝑥"
                Click={model.onButtonClicked}
            />
        </div>
    );
}
