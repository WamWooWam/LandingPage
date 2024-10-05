import { CoreApplication, IDeferrableEvent } from "@landing-page/api";

import { hydrate } from "preact";

const main = () => {
    const root = (
        <div>
            <h1>Settings</h1>
        </div>
    )

    hydrate(root, document.querySelector("#app"));
}

(async () => {
    const application = await CoreApplication.initializeAsync();
    
    if (application != null) {
        application.addEventListener("activated", () => {
            main();
        })

        application.run();
    }
    else {
        main();
    }
})();