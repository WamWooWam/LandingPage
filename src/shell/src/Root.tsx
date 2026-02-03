import "./Test"

import CharmsBarRenderer from "./Immersive/Charms/CharmsBarRenderer";
import CoreWindowContainer from "./Immersive/CoreWindow/CoreWindowContainer";
import MessageDialogRenderer from "./Immersive/MessageDialog/MessageDialogRenderer";
import PackageRegistry from "./Data/PackageRegistry";
import ScrollStateProvider from "./Immersive/Start/ScrollStateProvider";
import Start from "./Immersive/Start";
import { useEffect, useState } from "preact/hooks";

export default function Root() {
    const [layout, setLayout] = useState<string | null>(null);

    useEffect(() => {
        async function loadLayoutAndPackages() {
            const layout = document.getElementById("start-screen-xml").textContent;
            const packages = JSON.parse(document.getElementById("packages-json").textContent);

            for (const key in packages) {
                const pack = packages[key];
                PackageRegistry.registerPackage(pack);
            }

            setLayout(layout);
        }

        loadLayoutAndPackages();
    }, []);

    return  (
        <>
            <ScrollStateProvider>
               {layout && <Start layoutString={layout} />}
            </ScrollStateProvider>
            <CoreWindowContainer />
            <MessageDialogRenderer />
            <CharmsBarRenderer />
        </>
    );
}