import './style.css';

import { LocationProvider, Route, Router, hydrate, prerender as ssr } from 'preact-iso';

import { Header } from './components/Header.jsx';
import { Home } from './pages/Home/index.jsx';
import { NotFound } from './pages/_404.jsx';
import { Projects } from './pages/Projects';
import { locationStub } from 'preact-iso/prerender';


export function App() {
	return (
		<LocationProvider scope={/^\/old/}>
			<Header>
				<main>
					<Router>
						<Route path="/old/" component={Home} />
						<Route path="/old/projects/" component={Projects} />
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
	const { location, ...rest } = data;
	locationStub(location)

	return await ssr(<App {...rest} />);
}
