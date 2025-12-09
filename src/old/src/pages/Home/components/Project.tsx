export function Project({ name, byline, url }: { name: string; byline: string; url: string; }) {
	const text = byline.split(' ').slice(1).join(' ');

	return (
		<li>
			<a href={url}>... {text}</a>
		</li>
	);
}
