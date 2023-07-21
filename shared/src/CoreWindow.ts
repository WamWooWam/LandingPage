import { AppInstance } from "./AppInstance";

export interface CoreWindow {
    id: string;
    instance: AppInstance;
    view: HTMLElement;
    title: string;
}
