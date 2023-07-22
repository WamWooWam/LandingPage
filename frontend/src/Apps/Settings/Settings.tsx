import { Component, JSX, render } from "preact";
import { useState } from "preact/hooks";
import "./settings.scss"
import MainView from "./pages/mainview";
import WinJS from "winjs/light";
import BackButton from "winjs/controls/BackButton";
import ListView from "winjs/controls/ListView";
import AppBar from "winjs/controls/AppBar";
import AnimatedPageHost from "winjs/controls/AnimatedPageHost";
import AppBarCommand from "winjs/controls/AppBarCommand";

interface SidebarItem {
    title: string;
    page?: Promise<any>;
    subItems?: SidebarItem[];
}

const ListViewType = ListView<SidebarItem>;

export const SidebarItems: SidebarItem = {
    title: "PC settings",
    page: import("./pages/mainview"),
    subItems: [
        {
            title: "PC and devices", subItems: [
                { title: "Lock screen", page: import("./pages/lockscreen") },
                { title: "Display", page: import("./pages/blank") },
                { title: "Bluetooth", page: import("./pages/blank") },
                { title: "Devices", page: import("./pages/blank") },
                { title: "Mouse and touchpad", page: import("./pages/blank") },
                { title: "Typing", page: import("./pages/blank") },
                { title: "Corners and edges", page: import("./pages/blank") },
                { title: "Power and sleep", page: import("./pages/blank") },
                { title: "AutoPlay", page: import("./pages/blank") },
                { title: "Disk space", page: import("./pages/blank") },
                { title: "Advanced", page: import("./pages/blank") },
                { title: "PC info", page: import("./pages/about") },
            ]
        },
        { title: "Accounts", page: import("./pages/blank") },
        { title: "OneDrive", page: import("./pages/blank") },
        { title: "Search and apps", page: import("./pages/blank") },
        { title: "Privacy", page: import("./pages/blank") },
        { title: "Network", page: import("./pages/blank") },
        { title: "Time and language", page: import("./pages/blank") },
        { title: "Ease of Access", page: import("./pages/blank") },
        {
            title: "Update and recovery",
            subItems: [
                { title: "Windows Update", page: import("./pages/windowsupdate") },
                { title: "File History", page: import("./pages/blank") },
                { title: "Recovery", page: import("./pages/blank") }
            ]
        }
    ]
};

interface SettingsState {
    rootDataSource: WinJS.UI.IListDataSource<SidebarItem>;
    dataSource: WinJS.UI.IListDataSource<SidebarItem>;
    itemTemplate: WinJS.UI.IItemGenerator<SidebarItem>;
    itemHistory: SidebarItem[];
    title: string,
    page: any
}

export class Settings extends Component<{}, SettingsState> {
    constructor(props: {}) {
        super(props);

        let renderer = WinJS.Utilities.markSupportedForProcessing(async (itemPromise: WinJS.Promise<WinJS.UI.IItem<SidebarItem>>) => {
            const item = await itemPromise;
            let element = document.createElement("div");
            element.className = "sidebar-list-view-item";
            render(<p>{item.data.title}</p>, element);
            return element;
        });

        let dataSource = new WinJS.Binding.List(SidebarItems.subItems).dataSource;
        this.state = {
            rootDataSource: dataSource,
            dataSource: dataSource,
            itemTemplate: renderer,
            itemHistory: [],
            title: "PC settings",
            page: <MainView />
        };
    }

    componentDidMount(): void {
        WinJS.Navigation.addEventListener("navigating", this.onNavigating.bind(this));
        WinJS.Navigation.navigate(SidebarItems);
        WinJS.UI.processAll();
    }

    componentWillUnmount(): void {
        WinJS.Utilities.disposeSubTree(this.base as HTMLElement);
    }

    async onNavigating(e: CustomEvent<{ location: SidebarItem, state: any, delta: number }>) {
        // const Component = (await e.detail.location.page).default;
        // console.log(Component);

        let Component: any = null;
        if (e.detail.location.page) {
            Component = (await e.detail.location.page).default;
        }
        else {
            Component = (await e.detail.location.subItems[0].page).default;
        }

        // TODO: Handle this properly
        this.setState((state) => {
            let itemHistory = [...state.itemHistory];
            let dataSource = state.dataSource;
            let title = state.title;
            if (e.detail.delta < 0) {
                let delta = Math.abs(e.detail.delta) + 1;
                for (let i = 0; i < delta; i++) {
                    itemHistory.pop();
                }
            }

            if (e.detail.location.subItems) {
                dataSource = new WinJS.Binding.List(e.detail.location.subItems).dataSource as any;
                itemHistory.push(e.detail.location);
                title = e.detail.location.title;
            }

            return {
                title: title,
                itemHistory: itemHistory,
                dataSource: dataSource,
                page: <Component />
            };
        });

    }

    async onItemInvoked(e: CustomEvent<SidebarItem & { itemIndex: number }>) {
        let item = this.state.itemHistory[this.state.itemHistory.length - 1].subItems[e.detail.itemIndex];
        // if (item.subItems) {
        //     let first = item.subItems[0];
        //     // WinJS.UI.Animation.enterContent(sidebar, null);
        //     WinJS.Navigation.navigate(first);
        // }
        // else if (item.page) {
        //     WinJS.Navigation.navigate(item);
        // }

        WinJS.Navigation.navigate(item);
    }

    render() {
        return (
            <div id="settings-root" className="winjs-root">
                <AppBar placement="bottom" sticky={false} closedDisplayMode="none">
                    <AppBarCommand icon="back" label="Back" />
                    <AppBarCommand icon="settings" label="Settings" />
                    <AppBarCommand icon="help" label="Help" section="secondary" />
                </AppBar>
                <div class="container">
                    <div id="sidebar">
                        <div id="sidebar-content">
                            <div id="sidebar-list-view-header" class="inline-container">
                                <BackButton />
                                <h2 id="sidebar-title">{this.state.title}</h2>
                                <button class="sidebar-search-button"></button>
                            </div>
                            <div class="sidebar-list-view-container">
                                <ListViewType id="sidebar-list-view" itemDataSource={this.state.dataSource}
                                    itemTemplate={this.state.itemTemplate}
                                    oniteminvoked={this.onItemInvoked.bind(this)} />
                            </div>
                            <a id="control-panel-link" href="#">Control Panel</a>
                        </div>
                    </div>
                    <div id="contenthost">
                        <AnimatedPageHost page={this.state.page} />
                    </div>
                </div>
            </div>
        );
    }
}