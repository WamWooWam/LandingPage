import WinJS from "../js/WinJS";
import WinJSComponent from "./WinJSComponent";

export default class DatePicker extends WinJSComponent<DatePicker, WinJS.UI.DatePicker, "div"> {
    constructor(props: any) {
        super(props, "div");
    }

    createControl(element: HTMLDivElement): WinJS.UI.DatePicker {
        return new WinJS.UI.DatePicker(element, this.props);
    }
}