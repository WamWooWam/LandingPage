import { render } from "preact";
import { AboutMe } from "./AboutMe";

export default (target: HTMLElement) => {
    render(<AboutMe/>, target);
};