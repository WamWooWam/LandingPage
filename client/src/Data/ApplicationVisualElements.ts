import { ForegroundText } from "./PackageApplication";
import { ApplicationSplashScreen } from "./ApplicationSplashScreen";
import { ApplicationDefaultTile } from "./ApplicationDefaultTile";


export interface ApplicationVisualElements {
    displayName: string;
    description: string;
    square150x150Logo: string;
    square30x30Logo: string;

    foregroundText: ForegroundText;
    backgroundColor: string;

    defaultTile: ApplicationDefaultTile;
    splashScreen: ApplicationSplashScreen;
}
