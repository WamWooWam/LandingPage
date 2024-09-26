import DownArrow from "./DownArrow";

export default function AllAppsButton() {
    return (
        <button class="start-show-all-button start-arrow-button" role="button" aria-label={"Show all apps"}>
            <DownArrow width={32} height={32} />
        </button>
    );
}