import { ApplicationExtension } from "./ApplicationExtension";
import { ApplicationVisualElements } from "./ApplicationVisualElements";
export interface PackageApplicationModule {
    default: (target: HTMLElement) => void;
}
export interface PackageApplication {
    id: string;
    startPage: string;
    visualElements: ApplicationVisualElements;
    extensions: ApplicationExtension[];
    load?: () => Promise<PackageApplicationModule>;
}
export type ForegroundText = "light" | "dark";
