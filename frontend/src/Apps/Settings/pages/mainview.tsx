import { Component } from "preact";
import "./mainview.scss"
import WinJS from "winjs/light";

export default class MainView extends Component {
    componentDidMount(): void {
        WinJS.UI.Animation.enterPage(this.base as HTMLElement);
    }

    render() {
        return (
            <div class="main-view">
                <h2 class="section-header">Personalise</h2>

                <div id="personalise-grid">
                    <div id="lock-screen" class="personalise-button big">
                        <div class="personalise-content">
                            <p>Lock screen</p>
                        </div>
                    </div>

                    <div id="account-picture" class="personalise-button small">
                        <div class="personalise-content">
                            <p>Account picture</p>
                        </div>
                    </div>

                    <div id="picture-password" class="personalise-button medium">
                        <div class="personalise-content">
                            <p>Picture password</p>
                        </div>
                    </div>
                </div>

                <a id="recent-settings" href="#">View recently used settings</a>
            </div>
        );
    }
}