import { Component, ComponentChild, RenderableProps, createContext } from "preact";
import { Start } from "./Start";
import { ScrollStateProvider } from "./Start/ScrollStateProvider";

// The site is in a mobile context if the screen width is less than 600px and will update on resize
export const MobileContext = createContext(false);

export class Root extends Component<{}, { mobile: boolean }> {
    constructor(props: {}) {
        super(props);
        this.state = { mobile: false };
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateMobileContext);
        this.updateMobileContext();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateMobileContext);
    }

    updateMobileContext = () => {
        this.setState({ mobile: window.matchMedia ? window.matchMedia("(max-width: 600px)").matches : window.innerWidth < 600 });
    }

    render(props: RenderableProps<{}>, state?: Readonly<{}>, context?: any): ComponentChild {
        return (
            <MobileContext.Provider value={this.state.mobile}>
                <ScrollStateProvider>
                    <Start />
                </ScrollStateProvider>
            </MobileContext.Provider>
        )
    }
}