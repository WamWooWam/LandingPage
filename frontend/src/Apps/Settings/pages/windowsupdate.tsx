export default function WindowsUpdatePage() {
    return (
        <div class="main-view">
            <h2 class="section-header">Windows Update</h2>
            <div id="updates-checking">
                <p>Checking for updates</p>
                <progress class="checking-progress"></progress>
            </div>
            <div id="no-updates-available" class="hidden">
                <p>You're ready to automatically install updates.</p>
                <p>No updates are available. We'll continue to check daily for newer
                    updates.</p>
                <button class="check-button">Check now</button>
            </div>
            <p>
                <a id="view-update-history">View your update history</a>
            </p>
            <p>
                <a id="install-choice">Choose how updates get installed</a>
            </p>
        </div>
    );
}