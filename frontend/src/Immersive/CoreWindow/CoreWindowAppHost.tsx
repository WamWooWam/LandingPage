import { Component, Ref, RefObject, createRef } from 'preact';

import CoreWindow from '~/Data/CoreWindow';

interface CoreWindowAppHostProps {
    window: CoreWindow;
}

export default class CoreWindowAppHost extends Component<
    CoreWindowAppHostProps,
    { hasRendered: boolean }
> {
    private ref: RefObject<HTMLDivElement> = createRef();

    constructor(props: CoreWindowAppHostProps) {
        super(props);
        this.state = { hasRendered: false };
    }

    shouldComponentUpdate(): boolean {
        return !this.state.hasRendered;
    }

    async componentDidUpdate(): Promise<void> {
        if (this.ref.current && !this.state.hasRendered) {
            this.setState({ hasRendered: true });
            this.ref.current.appendChild(this.props.window.view);
            await this.props.window.load();
        }
    }

    componentWillUnmount(): void {
        try {
            this.ref.current.removeChild(this.props.window.view);
        } catch (e) {
            this.props.window.view.remove();
        }
    }

    render() {
        return <div ref={this.ref} className="core-window-app-host"></div>;
    }
}
