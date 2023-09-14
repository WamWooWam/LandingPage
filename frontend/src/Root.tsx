import { Component, ComponentChild, RenderableProps, createContext } from "preact";
import { Suspense, lazy } from "preact/compat"

import LayoutState from "./Data/LayoutState";
import ScrollStateProvider from "./Immersive/Start/ScrollStateProvider";
import Start from "./Immersive/Start";
import { hasWebP } from "./Util";

const CoreWindowContainer = lazy(() => import("./Immersive/CoreWindow/CoreWindowContainer"));
const MessageDialogRenderer = lazy(() => import("./Immersive/MessageDialog/MessageDialogRenderer"));

// The site is in a mobile context if the screen width is less than 600px and will update on resize
export const LayoutStateContext = createContext(LayoutState.windowsPhone81);
export const WebPContext = createContext(false);

interface RootState {
    layoutState: LayoutState;
    webp: boolean;
}

export default class Root extends Component<{}, RootState> {
    constructor(props: {}) {
        super(props);
        this.state = { layoutState: LayoutState.windowsPhone81, webp: true };
    }

    async componentWillMount() {
        if (typeof window === "undefined") {
            return;
        }

        window.addEventListener("resize", this.updateMobileContext);
        this.updateMobileContext();
        this.setState({ webp: await hasWebP() });
    }

    componentWillUnmount() {
        window?.removeEventListener("resize", this.updateMobileContext);
    }

    updateMobileContext = () => {
        let mobile = window.matchMedia ? window.matchMedia("(max-width: 600px)").matches : window.innerWidth < 600;
        this.setState({ layoutState: mobile ? LayoutState.windowsPhone81 : LayoutState.windows81 });
    }

    render(props: RenderableProps<{}>, state?: Readonly<{}>, context?: any): ComponentChild {
        return (
            <LayoutStateContext.Provider value={this.state.layoutState}>
                <WebPContext.Provider value={this.state.webp}>
                    <ScrollStateProvider>
                        <Start />
                    </ScrollStateProvider>

                    <Suspense fallback={<div class="core-window-container" />}><CoreWindowContainer /></Suspense>
                    <Suspense fallback={null}><MessageDialogRenderer /></Suspense>
                </WebPContext.Provider>
            </LayoutStateContext.Provider>
        )
    }
}