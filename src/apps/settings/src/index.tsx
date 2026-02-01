import { hydrate } from "preact";

const Badge = ({ href, src, alt }: { href: string, src: string, alt: string }) => {
    return (
        <a href={href}>
            <img src={src} alt={alt} />
        </a>
    );
}

export default function main(target: HTMLElement) {
    const root = (
        <div style={{ margin: '0 1em' }}>
            <h1>Currently under construction.</h1>
            <p>While you're here, feel free to grab my 88x31 badge for your own website!</p>
            <p>
                <Badge href='https://wamwoowam.co.uk/88x31.png' src="https://wamwoowam.co.uk/88x31.png" alt="Wam's button" />
            </p>
            <p>And peep these other cool people :3 <strong>TODO: Add more of these</strong></p>
            <p>
                <Badge href='https://aspyn.gay' src='https://aspyn.gay/88x31.gif' alt='aspyn.gay' />
                <Badge href='https://uwx.github.io' src='https://uwx.github.io/uwx.png' alt='Maxine' />
            </p>
        </div>
    )

    hydrate(root, target);
};