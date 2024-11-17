import { NextFunction, Request, Response } from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
    const time = performance.now();

    next();

    res.on('finish', () => {
        const responseTime = performance.now() - time;
        console.log(
            `${req.method} ${req.url} => ${res.statusCode} ${res.statusMessage}, ${responseTime.toFixed(2)}ms, ${res.get('Content-Length') || 0} bytes, ${req.get('User-Agent')}`,
        );
    });
};

export default logger;
