if (process.env.NODE_ENV === "development") {
    require("preact/debug");
}

import "./polyfill";
import './index.scss';
import './segoe.scss';

import AsyncRoute from "preact-async-route";
import PackageRegistry from "./Data/PackageRegistry";
import Router from "preact-router";
import { hydrate } from "preact"

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

if (typeof window !== "undefined") {
    const Main = () => (
        <Router>
            <AsyncRoute path="/" getComponent={() => import("./Root").then(m => m.default)} />
            <AsyncRoute path="/app/:packageId/:appId" getComponent={() => import("./StandaloneRoot").then(m => m.default)} />
        </Router>
    )

    hydrate(<Main />, document.body);
}