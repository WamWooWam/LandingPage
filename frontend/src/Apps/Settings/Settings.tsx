import { Component } from "preact";
import '../Shared/winjs-light.scss'
import "./settings.scss"
import { useState } from "preact/hooks";

const Items = [
    {
        title: "PC and devices", subItems: [
            { title: "Lock screen", page: "/pages/lockscreen.html" },
            { title: "Display", page: "/pages/blank.html" },
            { title: "Bluetooth", page: "/pages/blank.html" },
            { title: "Devices", page: "/pages/blank.html" },
            { title: "Mouse and touchpad", page: "/pages/blank.html" },
            { title: "Typing", page: "/pages/blank.html" },
            { title: "Corners and edges", page: "/pages/blank.html" },
            { title: "Power and sleep", page: "/pages/blank.html" },
            { title: "AutoPlay", page: "/pages/blank.html" },
            { title: "Disk space", page: "/pages/blank.html" },
            { title: "Advanced", page: "/pages/advanced.html" },
            { title: "PC info", page: "/pages/about.html" },
        ]
    },
    { title: "Accounts", page: "/pages/blank.html" },
    { title: "OneDrive", page: "/pages/blank.html" },
    { title: "Search and apps", page: "/pages/blank.html" },
    { title: "Privacy", page: "/pages/blank.html" },
    { title: "Network", page: "/pages/blank.html" },
    { title: "Time and language", page: "/pages/blank.html" },
    { title: "Ease of Access", page: "/pages/blank.html" },
    {
        title: "Update and recovery",
        subItems: [
            { title: "Windows Update", page: "/pages/windowsupdate.html" },
            { title: "File History", page: "/pages/blank.html" },
            { title: "Recovery", page: "/pages/blank.html" }
        ]
    }
];

const SidebarItem = (props: any) => {
    const [isPressed, setPressed] = useState(false);
    const classList = ["win-container"]
    if (isPressed) classList.push("win-pressed")

    return (
        <div class={classList.join(' ')} onMouseDown={() => setPressed(true)} onMouseUp={() => setPressed(false)}>
            <div class="win-itembox">
                <div class="win-template win-disposable win-item" role="option">
                    <div class="sidebar-list-view-item">
                        <p>{props.title}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export class Settings extends Component {
    render() {
        return (
            <div id="settings-root" className="winjs-root">
                <div class="container">
                    <div id="sidebar">
                        <div id="sidebar-content">
                            <div id="sidebar-list-view-header" class="inline-container">
                                <button id="sidebar-back-button"
                                    class="win-navigation-backbutton win-disposable"
                                    aria-label="Back"
                                    title="Back"
                                    type="button">
                                    <span class="win-back"></span>
                                </button>
                                <h2 id="sidebar-title">PC settings</h2>
                                <button class="sidebar-search-button"></button>
                            </div>
                            <div class="sidebar-list-view-container">
                                <div class="win-disposable win-listview win-swipeable win-element-resize">
                                    {Items.map((item) => {
                                        return (<SidebarItem key={item.title} title={item.title} />)
                                    })}
                                </div>
                            </div>
                            <a id="control-panel-link" href="#">Control Panel</a>
                        </div>
                    </div>
                    <div id="contenthost" data-win-control="Application.PageControlNavigator" data-win-options="{home: '/pages/mainview.html'}"></div>
                </div>
            </div>
        );
    }
}