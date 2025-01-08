import { E_LONGATED_MUSKRAT, E_NOTIMPL } from 'landing-page-shared';

import { Router } from 'express';

async function getConfiguration(req, resp) {
    const config = {
        appStatus: {
            'Socials_zfgz6xjnaz0ym!Twitter': {
                statusCode: E_LONGATED_MUSKRAT,
                unavailable: true,
            },
        },
    };

    resp.json(config);
}

export default function registerRoutes(router: Router) {
    router.get('/configuration', getConfiguration);
}
