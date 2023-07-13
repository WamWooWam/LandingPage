import { ApplicationExtension } from "./ApplicationExtension";
import { ApplicationVisualElements } from "./ApplicationVisualElements";

export interface PackageApplication {    
    id: string;
    startPage: string;

    visualElements: ApplicationVisualElements;
    extensions: ApplicationExtension[];
}

export type ForegroundText = "light" | "dark";

