if (process.env.NODE_ENV === 'development') {
    require('preact/debug');
}

import './polyfill';
import './index.scss';
import './segoe.scss';

import { LocationProvider, Route, Router, lazy, useLocation } from 'preact-iso';
import { hasAvif, hasWebP } from './Util';
import { hydrate, render } from 'preact';

import PackageRegistry from './Data/PackageRegistry';
import { useEffect } from 'preact/hooks';

const packages = [
    require('../../packages/Socials/AppxManifest.xml').default,
    require('../../packages/Projects/AppxManifest.xml').default,
    require('../../packages/Games/AppxManifest.xml').default,
    require('../../packages/Settings/AppxManifest.xml').default,
    require('../../packages/Calculator/AppxManifest.xml').default,
    require('../../packages/Friends/AppxManifest.xml').default,
];

for (const pack of packages) {
    PackageRegistry.registerPackage(pack);
}

Promise.all([hasWebP, hasAvif]);

const Main = () => {
    const route = useLocation();

    useEffect(() => {
        if (window.location.pathname.startsWith('/app')) return;

        const media = window.matchMedia('(max-width: 600px)');
        const handler = ({ matches }: MediaQueryList | MediaQueryListEvent) => {
            if (matches) {
                route.route('/mobile');
            } else {
                route.route('/');
            }
        };

        media.addEventListener('change', handler);
        handler(media);

        return () => {
            media.removeEventListener('change', () => {});
        };
    });

    return (
        <Router>
            <Route
                path="/"
                component={lazy(() => import('./Root').then((m) => m.default))}
            />
            <Route
                path="/mobile"
                component={lazy(() =>
                    import('./MobileRoot').then((m) => m.default),
                )}
            />
            <Route
                path="/app/:packageId/:appId"
                component={lazy(() =>
                    import('./StandaloneRoot').then((m) => m.default),
                )}
            />
        </Router>
    );
};

render(
    <LocationProvider>
        <Main />
    </LocationProvider>,
    document.body,
);
