if (process.env.NODE_ENV === "development") {
    require("preact/debug");
}

import "./polyfill";
import './index.scss';
import './segoe.scss';

import PackageRegistry from "./Data/PackageRegistry";
import StandaloneRoot from "./StandaloneRoot";
import { hydrate } from "preact"

let url = new URL(window.location.href);
let split = url.pathname.split("/");
let appId = split[split.length - 1];
let packageId = split[split.length - 2];

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

if (typeof document !== "undefined") {
    hydrate(<StandaloneRoot appId={appId} packageId={packageId} />, document.body);
}

export default StandaloneRoot;