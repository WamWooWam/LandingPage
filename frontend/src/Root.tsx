import "./Test"

import { Component, ComponentChild, RenderableProps, createContext } from "preact";
import { Suspense, lazy } from "preact/compat"

import LayoutState from "./Data/LayoutState";
import MessageDialogRenderer from "./Immersive/MessageDialog/MessageDialogRenderer";
import ScrollStateProvider from "./Immersive/Start/ScrollStateProvider";
import Start from "./Immersive/Start";

const CoreWindowContainer = lazy(() => import("./Immersive/CoreWindow/CoreWindowContainer"));
const CharmsBarRenderer = lazy(() => import("./Immersive/Charms/CharmsBarRenderer"));

// The site is in a mobile context if the screen width is less than 600px and will update on resize
export const LayoutStateContext = createContext(LayoutState.windowsPhone81);

interface RootState {
    layoutState: LayoutState;
    layoutStateMediaQuery?: MediaQueryList;
}

export default class Root extends Component<{}, RootState> {
    constructor(props: {}) {
        super(props);
        this.state = { layoutState: LayoutState.windowsPhone81 };
    }

    componentWillMount() {
        if (typeof window === "undefined") {
            return;
        }

        let mediaQuery = window.matchMedia("(max-width: 600px)");
        if (mediaQuery.addEventListener)
            mediaQuery.addEventListener("change", this.updateMobileContext);
        else
            mediaQuery.addListener(this.updateMobileContext);

        this.setState({ layoutStateMediaQuery: mediaQuery });
        this.updateMobileContext();
    }

    componentWillUnmount() {
        if (this.state.layoutStateMediaQuery) {
            const layoutStateMediaQuery = this.state.layoutStateMediaQuery;
            if (layoutStateMediaQuery.removeEventListener)
                layoutStateMediaQuery.removeEventListener("change", this.updateMobileContext);
            else
                layoutStateMediaQuery.removeListener(this.updateMobileContext);
        }
    }

    updateMobileContext = () => {
        this.setState((state) => ({ layoutState: (state.layoutStateMediaQuery?.matches ? LayoutState.windowsPhone81 : LayoutState.windows81) }));
    }

    render(props: RenderableProps<{}>, state?: Readonly<{}>, context?: any): ComponentChild {
        return (
            <LayoutStateContext.Provider value={this.state.layoutState}>
                <ScrollStateProvider>
                    <Start />
                </ScrollStateProvider>

                <Suspense fallback={<div class="core-window-container" />}><CoreWindowContainer /></Suspense>
                <MessageDialogRenderer />

                {this.state.layoutState === LayoutState.windows81 &&
                    <Suspense fallback={<div class="charms-bar-container" />}><CharmsBarRenderer /></Suspense>}
            </LayoutStateContext.Provider>
        )
    }
}