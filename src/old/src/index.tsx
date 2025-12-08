import './style.css';

import { LocationProvider, Route, Router, hydrate, prerender as ssr } from 'preact-iso';

import { Header } from './components/Header.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';

export function App() {
	return (
		<LocationProvider>
			<Header>
				<main>
					<Router>
						<Route path="/" component={Home} />
						<Route default component={NotFound} />
					</Router>
				</main>
			</Header>
		</LocationProvider>
	);
}

if (typeof window !== 'undefined') {
	hydrate(<App />, document.getElementById('app'));
}

export async function prerender(data) {
	return await ssr(<App {...data} />);
}
