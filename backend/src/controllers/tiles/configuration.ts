import { E_LONGATED_MUSKRAT } from 'landing-page-shared'
import { Router } from 'express';

async function getConfiguration(req, resp) {
    const config = {
        appStatus: {
            "Socials_zfgz6xjnaz0ym!Discord": {
                statusCode: 0x8000FFFF,
                unavailable: true
            }
        }
    }

    resp.json(config);
}

export default function registerRoutes(router: Router) {
    router.get('/configuration', getConfiguration);
}