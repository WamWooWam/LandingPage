import express, { Router } from "express";

import PackageRegistry from "src/PackageRegistry";
import path from "path";

export default function registerRoutes(router: Router) { 
    for (const pack of PackageRegistry.packages) {
        for (const app of Object.values(pack.applications)) {
            const entryPoint = app.entryPoint;
            if(!entryPoint.startsWith("/")) 
                continue;

            const startPagePath = path.join(pack.path, app.startPage);
            const rootPath = path.dirname(startPagePath);
            const startPageName = path.basename(startPagePath);

            router.use(entryPoint, express.static(rootPath, { maxAge: '90d', index: startPageName }));
        }        
    }
}