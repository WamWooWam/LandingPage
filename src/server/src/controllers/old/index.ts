import express, { Router, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs/promises";
import { prerender } from '@landing-page/old/dist/server/index.js'

const BASE = '/old'

let templateCache: string | null = null;
async function getTemplate() {
    if (templateCache) {
        return templateCache;
    }

    const oldDirectory = path.dirname(require.resolve("@landing-page/old"));
    const indexPath = path.join(oldDirectory, 'index.html');
    const template = await fs.readFile(indexPath, 'utf-8');
    return templateCache = template;
}

async function ssr(req: Request, res: Response, next: NextFunction) {
    const url = req.originalUrl;
    const template = await getTemplate();

    const data = {
        location: url
    };

    const { head, html } = await prerender(data);
    const responseHtml = template
        .replace('<!--app-head-->', head ?? '')
        .replace('<!--app-html-->', html ?? '');

    res.status(200)
       .set('Content-Type', 'text/html')
       .send(responseHtml);
}

export default async function registerRoutes(router: Router) {
    const oldDirectory = path.dirname(require.resolve("@landing-page/old"));
    const oldRouter = express.Router();
    oldRouter.use('/assets', express.static(path.join(oldDirectory, 'assets'), { index: false, maxAge: '90d' }));
    oldRouter.use(ssr);

    router.use(BASE, oldRouter);
}