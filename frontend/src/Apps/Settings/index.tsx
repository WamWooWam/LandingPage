import { render } from "preact";
import { Settings } from "./Settings"
import { AppInstance, ApplicationRoot, CoreWindow } from "../Shared";

export default (instance: AppInstance, window: CoreWindow) => {
    render(
        <ApplicationRoot instance={instance} window={window}>
            <Settings />
        </ApplicationRoot>,
        window.view)
}