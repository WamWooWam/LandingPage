import { Component, render } from "preact";
import WinJS from "../js/WinJS";
import WinJSComponent from "./WinJSComponent";

export default class ListView<T> extends WinJSComponent<ListView<T>, WinJS.UI.ListView<T>, "div"> {
    constructor(props: any) {
        super(props, "div");
    }

    createControl(element: HTMLDivElement): WinJS.UI.ListView<T> {
        let listView = new WinJS.UI.ListView<T>(element, {
            itemDataSource: this.props.itemDataSource,
            itemTemplate: this.props.itemTemplate,
            layout: this.props.layout ?? new WinJS.UI.ListLayout(),
            selectionMode: this.props.selectionMode ?? WinJS.UI.SelectionMode.none
        });

        if (this.props.oniteminvoked)
            listView.oniteminvoked = this.props.oniteminvoked;
        if (this.props.onselectionchanged)
            listView.onselectionchanged = this.props.onselectionchanged;

        return listView;
    }
}