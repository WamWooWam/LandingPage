import { Component, render } from "preact";
import { useState } from "preact/hooks";
import WinJS from "winjs/light";
import "./settings.scss"
import MainView from "./pages/mainview";

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

class BackButton extends Component {
    shouldComponentUpdate(): boolean {
        return false;
    }

    componentDidMount(): void {
        let backButton = new WinJS.UI.BackButton(this.base as HTMLElement)
        this.setState({ backButton: backButton });
    }

    render() {
        return (
            <button id="sidebar-back-button" />
        );
    }
}

class ListView extends Component {
    shouldComponentUpdate(): boolean {
        return false;
    }

    componentDidMount(): void {
        let renderer = WinJS.Utilities.markSupportedForProcessing((itemPromise: WinJS.Promise<WinJS.UI.IItem<any>>) => {
            return itemPromise.then((item) => {
                let element = document.createElement("div");
                element.className = "sidebar-list-view-item";
                render(<p>{item.data.title}</p>, element);
                return element;
            });
        });

        let listView = new WinJS.UI.ListView(this.base as HTMLElement, {
            itemDataSource: new WinJS.Binding.List(Items).dataSource,
            itemTemplate: renderer,
            layout: new WinJS.UI.ListLayout(),
            selectionMode: "single",

        });

        listView.addEventListener("iteminvoked", (e: CustomEvent) => {
            let item = Items[e.detail.itemIndex];
            if (item.page) {
                WinJS.Navigation.navigate(item.page);
            }
        });

        this.setState({ listView: listView });
    }

    render() {
        return (
            <div id="sidebar-list-view" />
        );
    }
}

export class Settings extends Component {
    componentDidMount() {
        WinJS.UI.processAll();
    }

    render() {
        return (
            <div id="settings-root" className="winjs-root">
                <div class="container">
                    <div id="sidebar">
                        <div id="sidebar-content">
                            <div id="sidebar-list-view-header" class="inline-container">
                                <BackButton />
                                <h2 id="sidebar-title">PC settings</h2>
                                <button class="sidebar-search-button"></button>
                            </div>
                            <div class="sidebar-list-view-container">
                                <ListView />
                            </div>
                            <a id="control-panel-link" href="#">Control Panel</a>
                        </div>
                    </div>
                    <div id="contenthost">
                        <div class="pagecontrol">
                            <MainView />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}