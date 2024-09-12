if (process.env.NODE_ENV === "development") {
    require("preact/debug");
}

import "./polyfill";
import './index.scss';
import './segoe.scss';

import Router, { route } from "preact-router";
import { hasAvif, hasWebP } from "./Util";

import AsyncRoute from "preact-async-route";
import PackageRegistry from "./Data/PackageRegistry";
import { hydrate } from "preact"
import { useEffect } from "preact/hooks";

const packages = [
    require('../../packages/Socials/AppxManifest.xml').default,
    require('../../packages/Projects/AppxManifest.xml').default,
    require('../../packages/Games/AppxManifest.xml').default,
    require('../../packages/Settings/AppxManifest.xml').default,
    require('../../packages/Calculator/AppxManifest.xml').default,
    require('../../packages/Friends/AppxManifest.xml').default,
];

for (const pack of packages) {
    PackageRegistry.registerPackage(pack);
}

Promise.all([hasWebP, hasAvif]);

if (typeof window !== "undefined") {
    const Main = () => {
        useEffect(() => {
            if (window.location.pathname.startsWith("/app"))
                return;

            const media = window.matchMedia("(max-width: 600px)");
            const handler = ({ matches }: MediaQueryList | MediaQueryListEvent) => {
                if (matches) {
                    route("/mobile");
                }
                else {
                    route("/");
                }
            }

            media.addEventListener("change", handler);
            handler(media);

            return () => {
                media.removeEventListener("change", () => { });
            }
        });

        return (
            <Router>
                <AsyncRoute path="/" getComponent={() => import("./Root").then(m => m.default)} />
                <AsyncRoute path="/mobile" getComponent={() => import("./MobileRoot").then(m => m.default)} />
                <AsyncRoute path="/app/:packageId/:appId" getComponent={() => import("./StandaloneRoot").then(m => m.default)} />
            </Router>
        )
    }

    hydrate(<Main />, document.body);
}