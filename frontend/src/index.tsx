if (process.env.NODE_ENV === "development") {
    require("preact/debug");
}

import "./polyfill";
import './index.scss';
import './segoe.scss';
import "./Test"

import { hydrate } from "preact"

import PackageRegistry from "./Data/PackageRegistry";
import Root from "./Root";

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
    // why the fuck is this a thing (iOS Safari)
    document.addEventListener("touchstart", function () { }, true);
    hydrate(<Root />, document.body);
}

export default Root;