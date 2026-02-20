import { RenderableProps } from 'preact';
import { useLocation } from 'preact-iso';

import "./header.css"

const urls = ['/old/', '/blog/', '/old/projects'];
const names = ['Home', 'Blog', 'Projects'];

export function Header({ children }: RenderableProps<{}>) {
	const { url } = useLocation();
	const activeIndex = urls.indexOf(url);
	const activeName = activeIndex !== -1 ? names[activeIndex] : null;

	return (
		<div className="header-container">
			<header>
				<h1>
					{activeName ? `Wam's ${activeName}` : "Wam's Old Site"}
				</h1>
				<nav className="nav">
					<ul className="nav-links">
						{urls.map((u, i) => (
							<li>
								<a href={u} aria-current={activeIndex === i ? 'page' : undefined} className={activeIndex === i ? 'active' : ''}>
									{names[i]}
								</a>
							</li>
						))}
					</ul>
				</nav>
			</header>
			{children}
		</div>
	);
}
