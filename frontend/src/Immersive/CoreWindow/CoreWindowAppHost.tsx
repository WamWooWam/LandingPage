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
    }

    shouldComponentUpdate(): boolean {
        return false;
    }

    async componentDidMount(): Promise<void> {
        if (this.ref.current) {
            console.log(this.ref.current, this.props.window.view);
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
