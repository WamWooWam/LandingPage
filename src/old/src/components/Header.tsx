import { RenderableProps } from 'preact';
import { useLocation } from 'preact-iso';

const urls = ['/', '/projects'];
const names = ['Home', 'Projects'];

export function Header({ children }: RenderableProps<{}>) {
	const { url } = useLocation();
	const activeIndex = urls.indexOf(url);
	const activeName = activeIndex !== -1 ? names[activeIndex] : null;

	return (
		<div>
			<header>
				<h1>
					{activeName ? `Wam's ${activeName}` : "Wam"}
				</h1>
			</header>
			<nav>
				<ul>
					{urls.map((u, i) => (
						<li>
							<a href={u} aria-current={activeIndex === i ? 'page' : undefined}>
								{names[i]}
							</a>
						</li>
					))}
				</ul>
			</nav>
			{children}
		</div>
	);
}
