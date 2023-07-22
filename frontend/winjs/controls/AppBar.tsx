import WinJS from "winjs/light";
import WinJSComponent from "./WinJSComponent";
import { ComponentChildren, Ref } from "preact";
import { JSX } from "preact/jsx-runtime";

export default class AppBar extends WinJSComponent<AppBar, WinJS.UI.AppBar, "div"> {
    constructor(props: any) {
        super(props, "div");
    }

    createControl(element: HTMLDivElement): WinJS.UI.AppBar {
        return new WinJS.UI.AppBar(element, this.props);
    }

    componentWillReceiveProps(nextProps: Readonly<any>, nextContext: any): void {
        super.componentWillReceiveProps(nextProps, nextContext);
    }
}