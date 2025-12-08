import DownArrow from "./DownArrow";
import { memo } from "preact/compat";

const AllAppsButton = memo(() => (
    <button class="start-show-all-button start-arrow-button" role="button" aria-label={"Show all apps"}>
        <DownArrow width={32} height={32} />
    </button>
));

export default AllAppsButton;   