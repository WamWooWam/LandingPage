import { Component, RenderableProps, createContext } from 'preact';

export const ScrollStateContext = createContext({
    totalWidth: 0,
    totalHeight: 0,
    scrollHeight: 0,
    scrollWidth: 0,
});

export interface ScrollState {
    totalWidth: number;
    totalHeight: number;
    scrollHeight: number;
    scrollWidth: number;
}

export default class ScrollStateProvider extends Component<{}, ScrollState> {
    constructor(props: {}) {
        super(props);

        this.state = {
            totalWidth: 0,
            totalHeight: 0,
            scrollHeight: 0,
            scrollWidth: 0,
        };
    }

    componentDidMount(): void {
        this.onScroll();
    }

    componentWillUnmount(): void {}

    private onScroll(): void {
        if (typeof window === 'undefined') {
            this.setState({
                totalWidth: 1024,
                totalHeight: 768,
                scrollHeight: 1024,
                scrollWidth: 768,
            });
            return;
        }

        let totalWidth = window.innerWidth;
        let totalHeight = Math.max(
            window.innerHeight,
            document.documentElement.scrollHeight,
        );
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
