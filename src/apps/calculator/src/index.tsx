import CalcManager from "./CalcManager/CalcManager"
import CalcManagerModule from "./CalcManager/CalcManager.wasm"
import CalculatorModel from "./CalculatorModel";
import MainPage from "./MainPage";
import VisualStateManager from "./VisualStateManager";
import css from "./calculator.scss"
import { hydrate } from "preact";

const Root = ({ manager }: { manager: any }) => {
    const model = new CalculatorModel(manager);
    return (
        <VisualStateManager visualStates={[{ className: "small", maxWidth: 600 }, { className: "medium", maxWidth: 1200 }, { className: "large", maxWidth: Number.POSITIVE_INFINITY }]}>
            <style dangerouslySetInnerHTML={{ __html: css }}></style>
            <MainPage model={model} />
        </VisualStateManager>
    )
}

export default async function main(target: HTMLElement) {
    const manager = await CalcManager({
        locateFile: (file: string) => {
            if (file.endsWith('.wasm')) {
                return CalcManagerModule;
            }
            return file;
        }
    })

    const app = document.createElement("app");
    target.appendChild(app);

    hydrate(<Root manager={manager} />, app);
}