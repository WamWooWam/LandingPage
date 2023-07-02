import { Component, RenderableProps, createContext } from "preact";

export const ScrollStateContext = createContext({ totalWidth: 0, totalHeight: 0, scrollHeight: 0, scrollWidth: 0 });

export interface ScrollState {
    totalWidth: number;
    totalHeight: number;
    scrollHeight: number;
    scrollWidth: number;
}

export class ScrollStateProvider extends Component<{}, ScrollState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            totalWidth: 0,
            totalHeight: 0,
            scrollHeight: 0,
            scrollWidth: 0
        }
    }

    componentDidMount(): void {
       // window.addEventListener("scroll", this.onScroll.bind(this), { passive: true });
       // window.addEventListener("resize", this.onScroll.bind(this));

        this.onScroll();
    }

    componentWillUnmount(): void {
       // window.removeEventListener("scroll", this.onScroll.bind(this));
       // window.removeEventListener("resize", this.onScroll.bind(this));
    }

    private onScroll(): void {
        let totalWidth = window.innerWidth;
        let totalHeight = Math.max(window.innerHeight, document.documentElement.scrollHeight);
        let scrollHeight = window.scrollY;
        let scrollWidth = window.scrollX;

        this.setState({ totalWidth, totalHeight, scrollHeight, scrollWidth });
    }

    render(props: RenderableProps<{}>, state: Readonly<ScrollState>) {
        return (
            <ScrollStateContext.Provider value={state}>
                {props.children}
            </ScrollStateContext.Provider>
        );
    }
}