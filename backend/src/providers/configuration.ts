import { E_LONGATED_MUSKRAT } from 'landing-page-shared'

export namespace Configuration {
    export async function getConfiguration(req, resp) {
        const config = {
            appStatus: {
                "Socials_zfgz6xjnaz0ym!Twitter": { isAvailable: false, statusCode: E_LONGATED_MUSKRAT },
            }
        }

        resp.json(config);
    }
}