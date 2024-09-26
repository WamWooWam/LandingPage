import { NextFunction, Request, Response } from "express";

import { HttpError } from "../utils";

const error = async (err: Error | Promise<void>, req: Request, res: Response, next: NextFunction) => {
    console.error(err)

    if (err instanceof HttpError) {
        res.status(err.status)
            .send(err.message);
        return;
    }

    if (process.env.NODE_ENV === 'development') {
        let error: any = err;
        if (err instanceof Error) {
            error = err.stack;
        }

        if ('then' in err && err.then) {
            error = await Promise.resolve(err).catch(e => e.stack);
        }

        if (typeof error !== 'string') error = JSON.stringify(error);

        res.status(500)
            .contentType('text/plain')
            .send(`error: ${error}`)
    }
    else {
        res.status(500)
            .contentType('text/plain')
            .send('Something went wrong! Please try again later.')
    }

    next();
};

export default error;