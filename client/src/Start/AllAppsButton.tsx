import ShowAllApps from "../../static/start/down-arrow.svg";
import { DownArrow } from "./DownArrow";

export function AllAppsButton() {
    return (
        <button class="start-show-all-button start-arrow-button" role="button">
            <DownArrow width={32} height={32} />
        </button>
    );
}