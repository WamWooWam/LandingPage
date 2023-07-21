import "preact/debug"
import "./polyfill";
import "./Test"
import './index.css';
import './segoe.css';

import { render } from "preact"
import PackageRegistry from "./Data/PackageRegistry";
import Root from "./Root";

const packages = [
    require('../../packages/Socials/AppxManifest.xml').default,
    require('../../packages/Projects/AppxManifest.xml').default,
    require('../../packages/Games/AppxManifest.xml').default,
    require('../../packages/Settings/AppxManifest.xml').default,
];


document.addEventListener("DOMContentLoaded", async () => {
    for (const pack of packages) {
        PackageRegistry.registerPackage(pack);
    }

    render(<Root />, document.body);
})
