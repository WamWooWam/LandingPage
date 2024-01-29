import { E_LONGATED_MUSKRAT } from 'landing-page-shared'

export namespace Configuration {
    export async function getConfiguration(req, resp) {
        const config = {
            appStatus: {}
        }

        resp.json(config);
    }
}