import { AppInstance, ApplicationRoot, CoreWindow } from "../Shared";

import { hydrate } from "preact";

export default (instance: AppInstance, window: CoreWindow) => {
    hydrate(
        <ApplicationRoot instance={instance} window={window}>
            <h1>Currently unavailable.</h1>
        </ApplicationRoot>,
        window.view)
}