import { useEffect, useState } from 'preact/hooks';
import { FEATURED_PROJECTS } from '../../data/projects';

import './style.css';

function Project(props: typeof FEATURED_PROJECTS[number]) {
	const style = props.plateColour ? { backgroundColor: props.plateColour } : {};

	return (
		<li>
			<a class="project" href={props.url} style={{ '--plate-colour': props.plateColour }}>
				{props.icon && <img class="project-icon"
					style={style}
					src={props.icon}
					alt={`${props.name} icon`} />}
				<div class="project-info">
					<h4>{props.name}</h4>
					<p>{props.byline}</p>
				</div>
			</a>
		</li>
	);
}

export function Projects() {
	const [projects, setProjects] = useState([]);

	useEffect(() => {
		fetch('https://api.github.com/users/wamwoowam/repos?sort=pushed&per_page=35')
			.then(res => res.json())
			.then((data) => {
				const filtered = data.filter((repo: any) =>
					!repo.fork &&
					!FEATURED_PROJECTS.find(p => p.repoSlug === repo.full_name.toLowerCase()));
				setProjects(filtered.map((repo: any) => ({
					name: repo.name,
					byline: repo.description || 'No description provided.',
					url: repo.html_url,
				})));
			});
	}, []);

	return (
		<div class="projects">
			<h2>Featured</h2>
			<ul class="project-list">
				{FEATURED_PROJECTS.map(p => <Project key={p.name} {...p} />)}
			</ul>
			<h2>More from GitHub</h2>
			<ul class="project-list">
				{projects.map(p => <Project key={p.name} {...p} />)}
			</ul>
			<a href="https://github.com/wamwoowam">Everything else!</a>
		</div>
	);
}
