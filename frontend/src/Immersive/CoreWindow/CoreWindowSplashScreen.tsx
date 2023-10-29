import "./core-window-splash-screen.scss"

import { ApplicationVisualElements } from "shared/ApplicationVisualElements";
import PackageImage from "~/Util/PackageImage";

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
                <PackageImage url={elements.splashScreen.image}>
                    {image => <img class="splash-screen-image" src={image} alt={`${elements.displayName} splash screen`} />}
                </PackageImage>                
            </div>
        </div>
    );
}

export default CoreWindowSplashScreen;