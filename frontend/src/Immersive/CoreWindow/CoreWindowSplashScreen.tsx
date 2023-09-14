import "./core-window-splash-screen.scss"

import { ApplicationVisualElements } from "shared/ApplicationVisualElements";

interface CoreWindowSplashScreenProps {
    elements: ApplicationVisualElements
    visible: boolean;
}

// 
// Represents a CoreWindow's splash screen
//
const CoreWindowSplashScreen = ({ elements, visible }: CoreWindowSplashScreenProps) => {
    let primaryColour = elements.backgroundColor;
    let splashColour = elements.splashScreen.backgroundColor
        && elements.splashScreen.backgroundColor != '' ?
        elements.splashScreen.backgroundColor :
        primaryColour;

    return (
        <div class={"splash-screen" + (visible ? " visible" : "")} style={{ background: splashColour }}>
            <div class="splash-screen-container">
                <img class="splash-screen-image" src={elements.splashScreen.image} alt={`${elements.displayName} splash screen`} />
            </div>
        </div>
    );
}

export default CoreWindowSplashScreen;