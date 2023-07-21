import { render } from "preact";
import { AboutMe } from "./AboutMe";
import { AppInstance, ApplicationRoot, CoreWindow } from "../Shared";

export default (instance: AppInstance, window: CoreWindow) => {
    render(
        <ApplicationRoot instance={instance} window={window}>
            <AboutMe />
        </ApplicationRoot>,
        window.view)
};