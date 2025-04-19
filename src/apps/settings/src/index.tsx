import { hydrate } from "preact";

(() => {
    const root = (
        <div>
            <h1>Settings</h1>
        </div>
    )

    hydrate(root, document.querySelector("#app"));
})();