import { AppInstance, ApplicationRoot, CoreWindow } from "../Shared";

import { AboutMe } from "./AboutMe";
import { hydrate } from "preact";

export default (instance: AppInstance, window: CoreWindow) => {
    const app = (
        <ApplicationRoot instance={instance} window={window}>
            <AboutMe />
        </ApplicationRoot>
    );
    
    hydrate(app, window.view)
};