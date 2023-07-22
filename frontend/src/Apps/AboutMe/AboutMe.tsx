import { AboutMeContent } from './AboutMeContent';
import WinJS from "winjs/light";
import "./aboutme.scss"

export const AboutMe = () => {
    WinJS.UI.processAll();

    console.log("AboutMe app rendering")
    return (
        <div id="about-me-root" className="winjs-root">

            <div class="header">
                <h1 class="header-text">Wam's Site</h1>
            </div>

            <main>
                <AboutMeContent />
            </main>

            <footer class="border-top footer text-muted">
            </footer>
        </div>
    );
};

