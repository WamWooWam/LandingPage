// import "preact/debug"

import "./polyfill";
import "./Test"
import './index.scss';
import './segoe.scss';

import { Component, hydrate, render } from "preact"
import PackageRegistry from "./Data/PackageRegistry";
import Root from "./Root";
import CoreWindowContainer from "./CoreWindow/CoreWindowContainer";
import { Launcher } from "./Test";
import Events from "./Events";
import AppLaunchRequestedEvent from "./Events/AppLaunchRequestedEvent";

export default Root;

const packages = [
    require('../../packages/Socials/AppxManifest.xml').default,
    require('../../packages/Projects/AppxManifest.xml').default,
    require('../../packages/Games/AppxManifest.xml').default,
    require('../../packages/Settings/AppxManifest.xml').default,
    require('../../packages/Calculator/AppxManifest.xml').default,
];

for (const pack of packages) {
    PackageRegistry.registerPackage(pack);
}

class StandaloneRoot extends Component {
    componentDidMount() {
        let url = new URL(window.location.href);
        let split = url.pathname.split("/");
        let appId = split[split.length - 1];
        let packageId = split[split.length - 2];
        if (appId && packageId) {
            let pack = PackageRegistry.getPackage(packageId);
            if (!pack) {
                throw new Error(`Package ${packageId} not found!`);
            }

            let app = pack.applications[appId];
            if (!app) {
                throw new Error(`Application ${appId} not found!`);
            }

            Events.getInstance().dispatchEvent(new AppLaunchRequestedEvent(pack, app, { noAnimation: true }));
        }
    }

    render() {
        return (<CoreWindowContainer />);
    }
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", async () => {
        hydrate(<StandaloneRoot />, document.body);
    })
}