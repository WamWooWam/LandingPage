import { Component, RefObject, createRef } from "preact";
import WinJS from "../js/WinJS";

interface AnimatedPageHostProps {
    page: any;
}

export default class AnimatedPageHost extends Component<AnimatedPageHostProps, {}> {

    ref: RefObject<HTMLDivElement>;

    constructor(props: AnimatedPageHostProps) {
        super(props);
        this.ref = createRef();
    }

    componentDidMount() {
        WinJS.UI.Animation.enterPage(this.ref.current);
    }

    componentDidUpdate(previousProps: Readonly<AnimatedPageHostProps>, previousState: Readonly<{}>, snapshot: any): void {
        if (previousProps.page === this.props.page) return;

        WinJS.UI.Animation.enterPage(this.ref.current);
    }

    render() {
        return (
            <div ref={this.ref} class="pagecontrol">
                {this.props.page}
            </div>
        );
    }
}