// import "preact/debug"

import "./polyfill";
import "./Test"
import './index.scss';
import './segoe.scss';

import { hydrate, render } from "preact"
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
    document.addEventListener("DOMContentLoaded", async () => {
        hydrate(<Root />, document.body);
    })
}