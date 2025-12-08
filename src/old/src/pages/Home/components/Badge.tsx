export function Badge({ label, image, url }: { label: string; image: string; url?: string; }) {
	return url ?
		(
			<a href={url} title={label} target="_blank" style="display: inline-block; margin: 2px;">
				<img src={image} alt={label} width="88" height="31" style="border: 1px solid #000; image-rendering: pixelated;" />
			</a>
		) :
		(
			<span title={label} style="display: inline-block; margin: 2px;">
				<img src={image} alt={label} width="88" height="31" style="border: 1px solid #000; image-rendering: pixelated;" />
			</span>
		);
}
