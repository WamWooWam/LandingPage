import { Component } from "preact";
import WinJS from "../js/WinJS";
import WinJSComponent from "./WinJSComponent";

export default  class BackButton extends WinJSComponent<BackButton, WinJS.UI.BackButton, "button"> {
    constructor(props: any) {
        super(props, "button");
    }

    createControl(element: HTMLButtonElement): WinJS.UI.BackButton {
        return new WinJS.UI.BackButton(element);
    }
}
