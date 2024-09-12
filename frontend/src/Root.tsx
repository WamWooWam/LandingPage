import "./Test"

import { Component, ComponentChild, RenderableProps, createContext } from "preact";
import { Suspense, lazy } from "preact/compat"

import MessageDialogRenderer from "./Immersive/MessageDialog/MessageDialogRenderer";
import ScrollStateProvider from "./Immersive/Start/ScrollStateProvider";
import Start from "./Immersive/Start";

const CoreWindowContainer = lazy(() => import("./Immersive/CoreWindow/CoreWindowContainer"));
const CharmsBarRenderer = lazy(() => import("./Immersive/Charms/CharmsBarRenderer"));


interface RootState {
}

export default class Root extends Component<{}, RootState> {
    constructor(props: {}) {
        super(props);
    }

    render(props: RenderableProps<{}>, state?: Readonly<{}>, context?: any): ComponentChild {
        return (
            <>
                <ScrollStateProvider>
                    <Start />
                </ScrollStateProvider>

                <Suspense fallback={<div class="core-window-container" />}><CoreWindowContainer /></Suspense>
                
                <MessageDialogRenderer />

                <Suspense fallback={<div class="charms-bar-container" />}><CharmsBarRenderer /></Suspense>
            </>
        )
    }
}