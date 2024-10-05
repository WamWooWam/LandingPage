import "./calculator.scss"

import { CoreApplication, IDeferrableEvent } from "@landing-page/api";

import CalcManager from "./CalcManager/CalcManager"
import CalcManagerModule from "./CalcManager/CalcManager.wasm"
import CalculatorModel from "./CalculatorModel";
import MainPage from "./MainPage";
import { VisualStateManager } from "./VisualStateManager";
import { hydrate } from "preact";

const main = async () => {
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
        <VisualStateManager visualStates={[{ className: "small", maxWidth: 600 }, { className: "medium", maxWidth: 1200 }, { className: "large", maxWidth: Number.POSITIVE_INFINITY }]}>
            <MainPage model={model} />
        </VisualStateManager>
    )

    hydrate(root, document.querySelector("#app"));
}

(async () => {
    const application = await CoreApplication.initializeAsync();
    if (application != null) {
        application.addEventListener("activated", async (e: IDeferrableEvent) => {
            const deferral = e.getDeferral();
            await main();

            deferral.complete();
        })

        application.run();
    }
    else {
        main();
    }
})();