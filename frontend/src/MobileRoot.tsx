// import "./Test"

import './mobile.scss';

import { Component, ComponentChild, RenderableProps } from 'preact';

interface RootState {}

export default class Root extends Component<{}, RootState> {
    constructor(props: {}) {
        super(props);
    }

    render(
        props: RenderableProps<{}>,
        state?: Readonly<{}>,
        context?: any,
    ): ComponentChild {
        return (
            <div class="mobile-error">
                <span class="background">:(</span>
                <div class="error">
                    <h1>
                        This website does not currently work on mobile devices.
                    </h1>
                    <p>
                        We're working on it though! In the meantime, try loading
                        this site on a desktop or laptop, or rotate your device!
                    </p>
                </div>
            </div>
        );
    }
}
