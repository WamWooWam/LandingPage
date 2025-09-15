if (process.env.NODE_ENV === "development") {
    require("preact/debug");
}

import "./polyfill";
import './index.scss';
import './segoe.scss';

import { LocationProvider, Route, Router } from "preact-iso";
import { hasAvif, hasWebP } from "./Util";

import Root from "./Root";
import { hydrate } from "preact"

Promise.all([hasWebP, hasAvif]);

const Main = () => {
    return (
        <LocationProvider>
            <Router>
                <Route path="/" component={Root} />
                <Route path="/app/:packageId/:appId" component={() => import("./StandaloneRoot").then(m => m.default)} />
            </Router>
        </LocationProvider>
    )
}

hydrate(<Main />, document.body);