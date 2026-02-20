// if (process.env.NODE_ENV === "development") {
//     require("preact/debug");
// }

// import "preact/debug"

import "./polyfill";
import './index.scss';
import './segoe.scss';

import { hasAvif, hasWebP } from "./Util";

import Root from "./Root";
import { render } from "preact"

Promise.all([hasWebP, hasAvif]);

render(<Root />, document.getElementById("app"));