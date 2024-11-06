import { AppInstance, ApplicationRoot, CoreWindow } from "../Shared";

import { render } from "preact";

export default (instance: AppInstance, window: CoreWindow) => {
    render(
        <ApplicationRoot instance={instance} window={window}>
            <h1>Currently unavailable.</h1>
        </ApplicationRoot>,
        window.view)
}