import { AppInstance } from "./AppInstance";
import { ApplicationExtension } from "./ApplicationExtension";
import { ApplicationVisualElements } from "./ApplicationVisualElements";
import { CoreWindow } from "./CoreWindow";

export interface PackageApplicationModule {
    default: (instance: AppInstance, window: CoreWindow) => void | Promise<void>;
};

export interface PackageApplication {
    id: string;
    startPage: string;
    entryPoint: string;
    visualElements: ApplicationVisualElements;
    extensions: ApplicationExtension[];
    load?: () => Promise<PackageApplicationModule>;
}

export type ForegroundText = "light" | "dark";

