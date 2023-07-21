import { Component } from "preact";
import "./core-window-splash-screen.scss"

interface CoreWindowSplashScreenProps {
    backgroundColour: string;
    splashImageUrl: string;
    visible: boolean;
}

// 
// Represents a CoreWindow's splash screen
//
const CoreWindowSplashScreen = (props: CoreWindowSplashScreenProps) => {
    return (
        <div class={"splash-screen" + (props.visible ? " visible" : "")} style={{ background: props.backgroundColour }}>
            <div class="splash-screen-container">
                <img class="splash-screen-image" src={props.splashImageUrl} />
            </div>
        </div>
    );
}

export default CoreWindowSplashScreen;