import { DOMParser, XMLSerializer } from 'xmldom';
import { Request, Response, Router } from 'express';

import { HttpError } from '../../utils';
import { TileTemplateType } from '../../TileTemplateType';
import { TileUpdateManager } from '../../TileUpdateManager';

const rootUrl = 'https://api.github.com';
const username = process.env.GITHUB_USERNAME;

const recentActivity = async (req: Request, res: Response) => {
    // fetch recent activity for a user

    let url = '';
    if (req.params.project === 'recent-activity') {
        url = `${rootUrl}/users/${username}/events`;
    } else {
        url = `${rootUrl}/repos/${req.params.username ?? username}/${req.params.project}/events`;
    }

    const resp = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LandingPage/1.0.0 (https://wamwoowam.co.uk)',
            Authorization: `Bearer ${process.env.GITHUB_API_KEY}`,
        },
    });

    if (!resp.ok) {
        throw new HttpError(500, 'Failed to fetch recent activity');
    }

    const json = await resp.json();

    let root = TileUpdateManager.getTemplateContent(
        TileTemplateType.tileWideSmallImageAndText03,
    );
    let rootElement = root.getElementsByTagName('tile')[0];
    rootElement.removeChild(rootElement.getElementsByTagName('visual')[0]);

    for (const event of json) {
        let visual = root.createElement('visual');
        rootElement.appendChild(visual);
        visual.setAttribute('version', '4');

        {
            let content = TileUpdateManager.getTemplateContent(
                TileTemplateType.tileSquare150x150Text02,
            );
            if (populateEvent(event, content, true)) {
                visual.appendChild(
                    root.importNode(
                        content.getElementsByTagName('binding')[0],
                        true,
                    ),
                );
            }
        }

        {
            let content = TileUpdateManager.getTemplateContent(
                TileTemplateType.tileWide310x150Text09,
            );
            if (populateEvent(event, content, false)) {
                visual.appendChild(
                    root.importNode(
                        content.getElementsByTagName('binding')[0],
                        true,
                    ),
                );
            }
        }
    }

    res.contentType('application/xml').send(
        new XMLSerializer().serializeToString(root),
    );
};

const populateEvent = (
    event: any,
    content: Document,
    isSmall: boolean,
): boolean => {
    let headerElement = content.getElementsByTagName('text')[0];
    headerElement.textContent = isSmall
        ? event.repo.name.split('/')[1]
        : event.repo.name;

    let textElement = content.getElementsByTagName('text')[1];
    switch (event.type) {
        case 'PushEvent':
            textElement.textContent = `${event.actor.login} pushed ${event.payload.size} commits`;
            break;
        case 'CreateEvent':
            textElement.textContent = `${event.actor.login} created ${event.payload.ref_type} ${event.payload.ref}`;
            break;
        case 'DeleteEvent':
            textElement.textContent = `${event.actor.login} deleted ${event.payload.ref_type} ${event.payload.ref}`;
            break;
        case 'ForkEvent':
            textElement.textContent = `${event.actor.login} forked ${event.repo.name}`;
            break;
        case 'IssuesEvent':
            textElement.textContent = `${event.actor.login} ${event.payload.action} issue #${event.payload.issue.number}`;
            break;
        case 'IssueCommentEvent':
            textElement.textContent = `${event.actor.login} commented on issue #${event.payload.issue.number}`;
            break;
        case 'PullRequestEvent':
            textElement.textContent = `${event.actor.login} ${event.payload.action} pull request #${event.payload.pull_request.number}`;
            break;
        case 'PullRequestReviewEvent':
            textElement.textContent = `${event.actor.login} reviewed pull request #${event.payload.pull_request.number}`;
            break;
        case 'PullRequestReviewCommentEvent':
            textElement.textContent = `${event.actor.login} commented on pull request #${event.payload.pull_request.number}`;
            break;
        case 'WatchEvent':
            textElement.textContent = `${event.actor.login} starred ${event.repo.name}`;
            break;
        case 'ReleaseEvent':
            textElement.textContent = `${event.actor.login} released ${event.payload.release.name}`;
            break;
        case 'PublicEvent':
            textElement.textContent = `${event.actor.login} open sourced ${event.repo.name}`;
            break;
        case 'CommitCommentEvent':
            textElement.textContent = `${event.actor.login} commented on commit ${event.payload.comment.commit_id}`;
            break;
        default:
            return false;
    }

    return true;
};

export default function registerRoutes(router: Router) {
    router.get('/github/:username/:project.xml', recentActivity);
}
