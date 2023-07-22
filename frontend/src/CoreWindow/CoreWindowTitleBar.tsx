import { Component } from "preact";
import CoreWindowMinimizeButton from "./CoreWindowMinimizeButton";
import CoreWindowCloseButton from "./CoreWindowCloseButton";

interface CoreWindowTitleBarProps {
    title: string;
    displayName: string;
    iconUrl: string;
    primaryColour: string;
    isVisible: boolean;

    minimiseClicked?: () => void;
    closeClicked?: () => void;
}

// 
// Represents a CoreWindow's title bar
//
export default class CoreWindowTitleBar extends Component<CoreWindowTitleBarProps> {
    render() {
        return (
            <div class={"core-window-titlebar " + (!this.props.isVisible ? "hidden" : "")}>
                <div class="core-window-titlebar-content">
                    <div class="core-window-icon-container" style={{ background: this.props.primaryColour }}>
                        <img class="core-window-icon" src={this.props.iconUrl} />
                    </div>

                    <div class="core-window-title">{this.props.title ? `${this.props.title} - ${this.props.displayName}` : this.props.displayName}</div>
                    <CoreWindowMinimizeButton onClick={this.props.minimiseClicked} />
                    <CoreWindowCloseButton onClick={this.props.closeClicked} />
                </div>
            </div>
        );
    }
}