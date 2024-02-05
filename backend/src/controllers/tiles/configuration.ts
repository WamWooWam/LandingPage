import { E_LONGATED_MUSKRAT } from 'landing-page-shared'
import { Router } from 'express';

async function getConfiguration(req, resp) {
    const config = {
        appStatus: {}
    }

    resp.json(config);
}

export default function registerRoutes(router: Router) {
    router.get('/configuration', getConfiguration);
}