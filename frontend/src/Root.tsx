import './Test';

import { Component, ComponentChild, RenderableProps } from 'preact';

import MessageDialogRenderer from './Immersive/MessageDialog/MessageDialogRenderer';
import ScrollStateProvider from './Immersive/Start/ScrollStateProvider';
import Start from './Immersive/Start';
import { lazy } from 'preact-iso';

const CoreWindowContainer = lazy(
    () => import('./Immersive/CoreWindow/CoreWindowContainer'),
);
const CharmsBarRenderer = lazy(
    () => import('./Immersive/Charms/CharmsBarRenderer'),
);

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
            <>
                <ScrollStateProvider>
                    <Start />
                </ScrollStateProvider>

                <CoreWindowContainer />
                <MessageDialogRenderer />
                <CharmsBarRenderer />
            </>
        );
    }
}
