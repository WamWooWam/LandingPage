import { Component } from "preact";
import "./splash-screen.css"

interface CoreWindowSplashScreenProps {
    backgroundColour: string;
    splashImageUrl: string;
    visible: boolean;
}

// 
// Represents a CoreWindow's splash screen
//
export class CoreWindowSplashScreen extends Component<CoreWindowSplashScreenProps> {
    render() {
        return (
            <div class={"splash-screen" + (this.props.visible ? " visible" : "")} style={{ background: this.props.backgroundColour }}>
                <div class="splash-screen-container">
                    <img class="splash-screen-image" src={this.props.splashImageUrl} />
                </div>
            </div>
        );
    }
}