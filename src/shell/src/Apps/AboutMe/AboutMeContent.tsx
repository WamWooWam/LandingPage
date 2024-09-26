import { Component } from "preact";

import Wam from "../../../static/wam.webp"

export class AboutMeContent extends Component {
    render() {
        return (
            <>
                <div class="people-me">
                    <div class="people-me-background"></div>
                    <div class="me-tile" role="button" aria-label="Thomas May">
                        <div class="me-tile-container">
                            <img src={Wam} class="me-tile-img" />
                        </div>
                        <div class="me-tile-primary">
                            <a class="me-tile-primary-text">Me</a>
                            <a class="me-tile-primary-text me-tile-primary-chevron" aria-hidden="true"></a>
                        </div>
                    </div>
                    <div class="notification-list">
                        <div class="notification-boiler-text">Welcome to my site! Here you'll find all my socials and projects!</div>
                    </div>
                </div>
                <div class="people-b">
                    <div class="people-b-background"></div>
                </div>
            </>
        );
    }
}