import fs = require('fs');
import mime = require('mime');
import crypto = require('crypto');
import path = require('path');
import vary = require('vary');
import os = require('os');
import sharp = require('sharp');

import { NextFunction, Request, Response } from 'express';

const supportedMimes = [
    'image/webp'
];

const _tempCache = [];

const send = function send(res: Response, path: string, cb: ErrorCallback = null) {
    var sendMethod = typeof res.sendFile === 'undefined' ?
        res.sendfile :
        res.sendFile;
    sendMethod.call(res, path, cb);
}

const sendAndSave = function sendAndSave(res: Response, path: string, cb: ErrorCallback = null) {
    _tempCache.push(path);
    send(res, path, cb);
};

export default (basePath: string, options: Partial<{ cacheDir: string }>) => {
    // use custom dir or choose default
    options = options || {};
    const cacheDir = options.cacheDir ?
        options.cacheDir :
        path.join(os.tmpdir(), 'webp-cache');

    // create cache dir if not exists
    const cachePathExists = fs.existsSync(path.join(cacheDir));
    if (!cachePathExists) {
        fs.mkdirSync(path.join(cacheDir));
    }

    /**
     * handles each request and checks if the browser supports webp, if not it will convert the image to png or jpg
     */
    const webpMiddleware = (req: Request, res: Response, next: NextFunction) => {
        const mimeType = mime.getType(req.originalUrl);
        const accept = req.headers.accept;

        const isWebp = supportedMimes.indexOf(mimeType) !== -1;
        const acceptWebp = accept && accept.indexOf('image/webp') !== -1;
        
        res.set('Vary', 'Accept');

        // just move on if mimetypes does not match
        if (!isWebp || acceptWebp) {
            next();
            return;
        }

        const hash = crypto.createHash('md5').update(req.originalUrl).digest('hex');
        const cachePath = path.join(cacheDir, hash);
        const imgPath = path.join(basePath, req.originalUrl);

        // try lookup cache for fast access
        if (_tempCache.indexOf(cachePath) !== -1) {
            send(res, cachePath, function (err) {
                if (err) {
                    _tempCache.splice(_tempCache.indexOf(cachePath), 1);
                    webpMiddleware(req, res, next);
                }
            });
            return;
        }

        if (fs.existsSync(cachePath)) {
            sendAndSave(res, cachePath);
            return;
        }

        // if the image has no alpha channel, we can convert it to jpg, otherwise we need to use png
        sharp(imgPath).metadata().then((metadata) => {
            let img = sharp(imgPath);
            img = metadata.hasAlpha ? img.png() : img.jpeg();
            img.toFile(cachePath, (err) => {
                if (err) {
                    next();
                    return;
                }

                res.contentType(metadata.hasAlpha ? 'image/png' : 'image/jpeg');
                sendAndSave(res, cachePath);
            });
        })
        .catch((err) => {
            next(err);
        });
    };

    return webpMiddleware;
};