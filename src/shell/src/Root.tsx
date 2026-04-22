import "./externals"

import PackageRegistry from "./Data/PackageRegistry";
// import ScrollStateProvider from "./Immersive/Start/ScrollStateProvider";
import Start from "./Immersive/Start";
import CharmsBarRenderer from "./Immersive/Charms/CharmsBarRenderer";
import CoreWindowContainer from "./Immersive/CoreWindow/CoreWindowContainer";
import MessageDialogRenderer from "./Immersive/MessageDialog/MessageDialogRenderer";
import { useEffect, useState } from "preact/hooks";
import { ErrorBoundary } from "preact-iso";

import { BADGES } from "@landing-page/old/src/data/badges";
import { Badge } from "@landing-page/old/src/pages/Home/components/Badge";
import { memo } from "preact/compat";

const Badges = memo(() => (<div style={{ display: 'none' }}>
    {BADGES.map((badge, index) => (<Badge key={index} {...badge} />))}
</div>));

export default function Root() {
    const [layout, setLayout] = useState<string | null>(null);

    useEffect(() => {
        async function loadLayoutAndPackages() {
            const layout = document.getElementById("start-screen-xml")!.textContent;
            const packages = JSON.parse(document.getElementById("packages-json")!.textContent);

            for (const key in packages) {
                const pack = packages[key];
                PackageRegistry.registerPackage(pack);
            }

            setLayout(layout);
        }

        loadLayoutAndPackages();
    }, []);

    return (
        <ErrorBoundary>
            {/* <ScrollStateProvider> */}
                {layout && <Start layoutString={layout} />}
            {/* </ScrollStateProvider> */}

            <CharmsBarRenderer />
            <CoreWindowContainer />
            <MessageDialogRenderer />

            <Badges />
        </ErrorBoundary>
    );
}