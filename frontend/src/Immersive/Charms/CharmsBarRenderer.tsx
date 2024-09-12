import "./charms-bar.scss"

import CharmsBarClock from "./CharmsBarClock";
import { Component } from "preact";

type CharmsBarRendererState = {
    isInGesture: boolean;
    initialX: number;
    initialY: number;
    lightDismissTimeout: number;
    openState: CharmsBarOpenState;
}

enum CharmsBarOpenState {
    closed,
    lightDismiss,
    open,
    closing
}


export default class CharmsBarRenderer extends Component<{}, CharmsBarRendererState> {

    constructor(state: {}) {
        super({});
        this.state = { isInGesture: false, initialX: -1, initialY: -1, lightDismissTimeout: -1, openState: CharmsBarOpenState.closed };
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    componentDidMount(): void {
        document.addEventListener("mousemove", this.onMouseMove);
    }

    componentWillUnmount(): void {
        document.removeEventListener("mousemove", this.onMouseMove);
    }

    onMouseMove(e: MouseEvent): void {
        const x = e.pageX;
        const y = e.pageY;
        const pageWidth = document.body.clientWidth;
        const pageHeight = document.body.clientHeight;

        if (this.state.openState != CharmsBarOpenState.open) {
            if (!this.state.isInGesture) {
                if (x < pageWidth && x >= pageWidth - 20 && ((y > 0 && y <= 20) || (y > pageHeight - 20 && y <= pageHeight))) {
                    // right side, charms bar 
                    let timeout = window.setTimeout(this.showCharmsLightOverlay.bind(this), 1000);
                    this.setState({ lightDismissTimeout: timeout });
                    this.beginGesture(x, y);
                }
            }
            else {
                if (!(x < pageWidth && x >= pageWidth - 50)) {
                    this.endGesture();
                    this.closeAll();
                }

                let yDelta = Math.abs(this.state.initialY - y);
                if (yDelta > 100) {
                    this.showCharms();
                }
            }
        }
        else {
            if (!(x < pageWidth && x >= pageWidth - 100)) {
                this.endGesture();
                this.closeAll();
            }
        }
    }

    private beginGesture(x: number, y: number) {
        console.log("begin charms bar gesture");

        this.setState({ isInGesture: true, initialX: x, initialY: y });
    }

    private endGesture() {
        console.log("no gesture");
        window.clearTimeout(this.state.lightDismissTimeout);
        this.setState({ isInGesture: false, initialX: -1, initialY: -1, lightDismissTimeout: -1 });
    }

    private showCharmsLightOverlay() {
        this.setState((state) => ({
            openState: (state.openState === CharmsBarOpenState.closed ? CharmsBarOpenState.lightDismiss : state.openState)
        }));
    }

    private showCharms() {
        console.log("show charms");
        this.endGesture();

        this.setState({ openState: CharmsBarOpenState.open });
    }

    private closeAll() {
        console.log("close charms");

        this.setState({ openState: CharmsBarOpenState.closing });
    }

    private onTransitionEnd() {
        if (this.state.openState == CharmsBarOpenState.closing) {
            this.setState({ openState: CharmsBarOpenState.closed });
        }
    }

    render() {
        let className = "";

        switch (this.state.openState) {
            case CharmsBarOpenState.open:
                className += " open"; // intentional fallthrough
            case CharmsBarOpenState.lightDismiss:
                className += " visible";
                break;
            case CharmsBarOpenState.closing:
                className += " fade-out";
                break;
        }

        return (
            <div class={"charms-bar-container" + className}>

                <div class="charms-bar-clock">
                    <div class="charms-bar-clock-icons">
                        {/* network icon, power icon, these dont really do anything */}
                    </div>

                    <CharmsBarClock />
                </div>

                <div class={"charms-bar" + className} onTransitionEnd={this.onTransitionEnd.bind(this)}>
                    <ul class="charms-bar-items">
                        <a role="listitem" class="charms-bar-item charms-bar-search">
                            <div class="charms-bar-image"></div>
                            <p>Search</p>
                        </a>
                        <a role="listitem" class="charms-bar-item charms-bar-share">
                            <div class="charms-bar-image"></div>
                            <p>Share</p>
                        </a>
                        <a role="listitem" class="charms-bar-item charms-bar-start">
                            <div class="charms-bar-image">
                                <div class="highlight-effect" />
                            </div>
                            <p>Start</p>
                        </a>
                        <a role="listitem" class="charms-bar-item charms-bar-devices">
                            <div class="charms-bar-image"></div>
                            <p>Devices</p>
                        </a>
                        <a role="listitem" class="charms-bar-item charms-bar-settings">
                            <div class="charms-bar-image"></div>
                            <p>Settings</p>
                        </a>
                    </ul>
                </div>
            </div>
        );
    }
}