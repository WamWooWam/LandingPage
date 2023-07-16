import { h, render } from 'preact';

import "./aboutme.scss"
import "../Shared/winjs-light.scss"
import { AboutMeContent } from './AboutMeContent';

export const AboutMe = () => {
    console.log("AboutMe app rendering")
    return (
        <div id="about-me-root" className="winjs-root">

            <div class="header">
                <h1 class="header-text">Wam's Site</h1>
            </div>

            <main>
                <AboutMeContent/>
            </main>

            <footer class="border-top footer text-muted">
            </footer>
        </div>
    );
};

