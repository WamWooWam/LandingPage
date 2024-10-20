import { NextFunction, Request, Response } from "express";

// yoinked from https://stackoverflow.com/questions/13686470/how-can-i-convert-numeric-http-status-code-to-its-display-name-in-javascript
const HTTP_STATUSES = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    203: 'Non-Authoritative Information',
    204: 'No Content',
    205: 'Reset Content',
    206: 'Partial Content',
    300: 'Multiple Choices',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    304: 'Not Modified',
    305: 'Use Proxy',
    306: 'Unused',
    307: 'Temporary Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    402: 'Payment Required',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    406: 'Not Acceptable',
    407: 'Proxy Authentication Required',
    408: 'Request Timeout',
    409: 'Conflict',
    410: 'Gone',
    411: 'Length Required',
    412: 'Precondition Required',
    413: 'Request Entry Too Large',
    414: 'Request-URI Too Long',
    415: 'Unsupported Media Type',
    416: 'Requested Range Not Satisfiable',
    417: 'Expectation Failed',
    418: 'I\'m a teapot',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout',
    505: 'HTTP Version Not Supported',
};

const logger = (req: Request, res: Response, next: NextFunction) => {
    const time = performance.now();

    next();

    res.on('finish', () => {
        const responseTime = performance.now() - time;
        const statusMessage = res.statusMessage || HTTP_STATUSES[res.statusCode] || 'OK';
        console.log(`${req.method} ${req.originalUrl} => ${res.statusCode} ${statusMessage}, ${responseTime.toFixed(2)}ms, ${res.get('Content-Length') || 0} bytes, '${req.get('User-Agent')}'`);
    });
};

export default logger;