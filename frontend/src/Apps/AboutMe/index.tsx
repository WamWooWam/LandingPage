import { AppInstance, ApplicationRoot, CoreWindow } from '../Shared';

import { AboutMe } from './AboutMe';
import { render } from 'preact';

export default (instance: AppInstance, window: CoreWindow) => {
    const app = (
        <ApplicationRoot instance={instance} window={window}>
            <AboutMe />
        </ApplicationRoot>
    );

    render(app, window.view);
};
