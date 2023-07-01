import { TileTemplateType } from "../TileTemplateType";
import { TileUpdateManager } from "../TileUpdateManager";
import { DOMParser, XMLSerializer } from 'xmldom'

export namespace GitHub {
    const rootUrl = 'https://api.github.com'
    const username = process.env.GITHUB_USERNAME;

    const populateEvent = (event: any, content: Document, isSmall: boolean): boolean => {
        let headerElement = content.getElementsByTagName("text")[0];
        headerElement.textContent = isSmall ? event.repo.name.split('/')[1] : event.repo.name;

        let textElement = content.getElementsByTagName("text")[1];
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
    }

    export const recentActivity = async (req, res) => {
        // fetch recent activity for a user
        const url = `${rootUrl}/users/${username}/events`
        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'wamwoowam'
            }
        })

        const json = await resp.json()

        let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileWideSmallImageAndText03);
        let root = new DOMParser().parseFromString(tile, 'application/xml');
        let rootElement = root.getElementsByTagName("tile")[0];
        rootElement.removeChild(rootElement.getElementsByTagName("visual")[0]);
        
        for (const event of json) {
            let visual = root.createElement("visual");
            rootElement.appendChild(visual);
            visual.setAttribute("version", "4");

            {
                let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileSquare150x150Text02);
                let content = new DOMParser().parseFromString(tile, 'application/xml');
                if (populateEvent(event, content, true)) {
                    visual.appendChild(root.importNode(content.getElementsByTagName("binding")[0], true));
                }
            }

            {
                let tile = TileUpdateManager.getTemplateContent(TileTemplateType.tileWide310x150Text09);
                let content = new DOMParser().parseFromString(tile, 'application/xml');
                if (populateEvent(event, content, false)) {
                    visual.appendChild(root.importNode(content.getElementsByTagName("binding")[0], true));
                }
            }
        }

        res.contentType('application/xml')
            .send(new XMLSerializer().serializeToString(root));
    };
}