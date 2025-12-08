export function Project({ name, byline, url }: { name: string; byline: string; url: string; }) {
	return (
		<li>
			<a href={url}>... {byline}</a>
		</li>
	);
}
