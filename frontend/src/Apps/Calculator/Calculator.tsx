import { Component } from "preact";
import CalculationResult from "./CalculationResult";
import CalculatorStandardOperators from "./CalculatorStandardOperators";
import CalculatorNumberPad from "./CalculatorNumberPad";

export default function Calculator() {
    return (
        <div class="calculator">
            <CalculationResult />

            <div class="calc-buttons-root">
                <div class="scientific-panel">
                    <div class="calc-scientific-buttons">
                    </div>
                    <CalculatorStandardOperators />
                </div>

                <CalculatorNumberPad />
            </div>
        </div>
    )
}