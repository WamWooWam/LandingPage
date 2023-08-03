import { Component } from "preact";
import { useContext, useState } from "preact/hooks";
import { ViewModelContext } from "./MainPage";
import { AutoTextSize } from "auto-text-size";
import { VisualStateContext } from "./VisualStateManager";

export default function CalculationResult() {
    const viewModel = useContext(ViewModelContext);
    const state = useContext(VisualStateContext);
    const [result, setResult] = useState<string>("0");
    viewModel.result.subscribe((result) => setResult(result));

    let maxFontSizePt = 82;
    let minFontSizePt = 29.333;

    if (state.className === "small") {
        maxFontSizePt = 36;
        minFontSizePt = 18;
    }

    return (
        <div class="results">
            <div class="expression">{viewModel.expression}</div>
            <div class="result">
                <AutoTextSize minFontSizePx={minFontSizePt * (96 / 72)} maxFontSizePx={maxFontSizePt * (96 / 72)}>
                    {result}
                </AutoTextSize>
            </div>
        </div>
    )
}