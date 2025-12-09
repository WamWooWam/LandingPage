import './style.css';

import { BADGES } from '../../data/badges';
import { Badge } from './components/Badge';
import { FEATURED_PROJECTS } from '../../data/projects';
import { Project } from './components/Project';

export function Home() {
	// shuffle all badges except the first one
	const shuffled = BADGES.slice(1).sort(() => Math.random() - 0.5);
	BADGES.splice(1, BADGES.length - 1, ...shuffled);

	return (
		<div class="home">
			<p>Hi! Welcome to the old place. This should work properly in older browsers,
				and I needed a better place to put my 88x31s, feel free to poke around and
				have fun! Or, <a href="/">return to the new site.</a></p>

			<h2>Wait a minute, who <i>are</i> you?</h2>
			<p>Hi! I'm Wam, I make apps, webtoys, videos and occasionally fires (though typically
				by accident.) If I'm doing anything it probably involves a Windows Phone or a
				PowerPC based Mac. Or both. Both is also good.</p>
			<p>You might've used my stuff before like the...</p>
			<ul>
				{FEATURED_PROJECTS.map(p => <Project key={p.name} {...p} />)}
				<li><a href="https://github.com/WamWooWam">... and so many more things besides.</a></li>
			</ul>
			<p>and obviously the <a href="https://wamwoowam.co.uk/">faithful recreation of the Windows
				8.1 start screen with working live tiles.</a></p>
			<p>You might also find these other projects interesting!</p>
			<ul>
				<li><a href="https://github.com/ReLiveWP">(WIP) Restoring Windows Live services
					for Windows Phone 7</a></li>
				<li><a href="https://wamwoowam.co.uk/x264">Completely destroying images with H.264</a></li>
				<li><a href="https://os.wamwoowam.co.uk/">Implementing parts of the Win32 API in pure
					JavaScript + WebWorkers</a>&nbsp;
					<small><a href="https://github.com/WamWooWam/WindowServer">(source)</a></small></li>
				<li><a href="https://github.com/WamWooWam/WinRTElectron">Porting some Windows 8.1 Metro
					apps to run inside Electron on desktop</a></li>
				<li><a href="https://github.com/WamWooWam/RSDKv5-Decompilation/releases/tag/v0.1.0-mac-legacy">
					A PowerPC Mac OS X port of Sonic Mania</a></li>
				<li><a href="https://github.com/WamWooWam/RSDKv4.NET">A C#/.NET port of Sonic 1 & 2 (2013)
					targeting Windows Phone 7.5</a></li>
			</ul>

			<h2>Enough about me, take a look at these awesome people!</h2>
			<p>Some of my wonderful, terminally online friends/acquaintances with their own 88x31 badges. <b>If you've got your own site, feel free to add mine!</b></p>
			<div class="badges">
				{BADGES.map(b => <Badge key={b.url} {...b} />)}
			</div>
		</div>
	);
}
