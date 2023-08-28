import { Package } from "shared/Package";
import { PackageApplication } from "shared/PackageApplication";

export interface AppStatus {
    statusCode: number;
}

interface Configuration {
    appStatus: {
        [key: string]: AppStatus;
    }
}

export default class ConfigurationManager {
    private static _configurationPromise: Promise<Configuration> | null = null;

    static async getAppStatus(app: PackageApplication, pack: Package): Promise<AppStatus> {
        if (!ConfigurationManager._configurationPromise) {
            ConfigurationManager._configurationPromise = ConfigurationManager.getConfiguration();
        }

        const config = await ConfigurationManager._configurationPromise;
        const appStatus = config.appStatus[`${pack.identity.packageFamilyName}!${app.id}`];
        if (!appStatus) {
            return { statusCode: 0 };
        }

        return appStatus;
    }

    private static async getConfiguration() {
        const response = await fetch('/api/configuration');
        return await response.json();
    }
}