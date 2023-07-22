import { Component } from "preact";
import "./about.scss"

export default class AboutPage extends Component {
    render() {
        return (
            <div class="main-view">
                <h2 class="section-header">PC</h2>

                <div class="group">
                    <span class="column-1">PC name</span> <span id="pc-name-span" class="column-2">JSPC</span>
                </div>

                <div class="button-group">
                    <button>Rename PC</button>
                    <button>Join a domain</button>
                </div>

                <div class="group">
                    <span class="column-1">User Agent</span> <span class="column-2" id="user-agent-span">{navigator.userAgent}</span>
                </div>

                <div class="group">
                    <span class="column-1">Host OS</span> <span class="column-2" id="host-os-span"></span>
                </div>

                <div class="group">
                    <span class="column-1">Host Browser</span> <span class="column-2" id="host-browser-span"></span>
                </div>

                <h2 class="section-header" style="margin-top: 20px;">Windows</h2>
                <div class="group">
                    <span class="column-1">Edition</span> <span class="column-2">Windows 8.1 Pro</span>
                </div>

                <div class="group">
                    <span class="column-1">Activation</span> <span class="column-2">Windows is activated</span>
                </div>

                <div class="button-group">
                    <button>Change product key</button>
                </div>
            </div>
        );
    }
}