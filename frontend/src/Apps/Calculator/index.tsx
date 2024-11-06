import "./calculator.scss"

import { AppInstance, ApplicationRoot, CoreWindow } from "../Shared";

import CalcManager from "./CalcManager/CalcManager"
import CalcManagerModule from "./CalcManager/CalcManager.wasm"
import CalculatorModel from "./CalculatorModel";
import MainPage from "./MainPage";
import { VisualStateManager } from "./VisualStateManager";
import { render } from "preact";

export default async (instance: AppInstance, window: CoreWindow) => {
    const manager = await CalcManager({
        locateFile: (file: string) => {
            if (file.endsWith('.wasm')) {
                return CalcManagerModule;
            }
            return file;
        }
    });

    const model = new CalculatorModel(manager);
    const root = (
        <ApplicationRoot instance={instance} window={window}>
            <VisualStateManager visualStates={[{ className: "small", maxWidth: 600 }, { className: "medium", maxWidth: 1200 }, { className: "large", maxWidth: Number.POSITIVE_INFINITY }]}>
                <MainPage model={model} />
            </VisualStateManager>
        </ApplicationRoot>
    )

    render(root, window.view)
}