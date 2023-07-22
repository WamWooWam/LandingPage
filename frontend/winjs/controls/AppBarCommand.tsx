import WinJS from "winjs/light";
import WinJSComponent from "./WinJSComponent";

export default class AppBarCommand extends WinJSComponent<AppBarCommand, WinJS.UI.AppBarCommand, "button"> {
    constructor(props: any) {
        super(props, "button");
    }

    createControl(element: HTMLButtonElement): WinJS.UI.AppBarCommand {
        return new WinJS.UI.AppBarCommand(element, this.props);
    }
}