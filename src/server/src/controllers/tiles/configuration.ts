import { E_LONGATED_MUSKRAT } from '@landing-page/shared'
import { Request, Response, Router } from 'express';

export function getConfig() {
    const config = {
        appStatus: {
            "Socials_zfgz6xjnaz0ym!Twitter": {
                statusCode: E_LONGATED_MUSKRAT,
                unavailable: true
            }
        }
    }

    return config;
}

async function getConfiguration(req: Request, resp: Response) {
    const config = getConfig();
    resp.json(config);
}

export default function registerRoutes(router: Router) {
    router.get('/configuration', getConfiguration);
}