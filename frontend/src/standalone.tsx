if (process.env.NODE_ENV === "development") {
    require("preact/debug");
}

import "./polyfill";
import './index.scss';
import './segoe.scss';
import "./Test"

import PackageRegistry from "./Data/PackageRegistry";
import StandaloneRoot from "./StandaloneRoot";
import { hydrate } from "preact"

let url = new URL(window.location.href);
let split = url.pathname.split("/");
let appId = split[split.length - 1];
let packageId = split[split.length - 2];
const packages = {
    "Socials_zfgz6xjnaz0ym": "Socials",
    "Projects_zfgz6xjnaz0ym": "Projects",
    "Games_zfgz6xjnaz0ym": "Games",
    "windows.immersivecontrolpanel_cw5n1h2txyewy": "Settings",
    "Microsoft.WindowsCalculator_8wekyb3d8bbwe": "Calculator",
}

async function loadPackage(packageId: string) {
    switch (packages[packageId as keyof typeof packages] || packageId.split("_")[0]) {
        case "Socials":
            return (await import('../../packages/Socials/AppxManifest.xml')).default;
        case "Projects":
            return (await import('../../packages/Projects/AppxManifest.xml')).default;
        case "Games":
            return (await import('../../packages/Games/AppxManifest.xml')).default;
        case "Settings":
            return (await import('../../packages/Settings/AppxManifest.xml')).default;
        case "Calculator":
            return (await import('../../packages/Calculator/AppxManifest.xml')).default;
        default:
            throw new Error(`Package ${packageId} not found!`);
    }
}

PackageRegistry.registerPackage(await loadPackage(packageId));

if (typeof document !== "undefined") {
    hydrate(<StandaloneRoot appId={appId} packageId={packageId} />, document.body);
}

export default StandaloneRoot;