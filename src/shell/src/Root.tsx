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
            const [layout, packages] = await Promise.all([
                fetch("/api/start-screen.xml", { mode: 'no-cors' }).then(r => r.text()),
                fetch("/api/packages.json", { mode: 'no-cors' }).then(r => r.json()),
            ]);

            for (const key in packages) {
                const pack = packages[key];
                PackageRegistry.registerPackage(pack);
            }

            setLayout(layout);
        }

        loadLayoutAndPackages();
    }, []);

    return layout && (
        <>
            <ScrollStateProvider>
                <Start layoutString={layout} />
            </ScrollStateProvider>  
            <CoreWindowContainer />
            <MessageDialogRenderer />
            <CharmsBarRenderer />
        </>
    );
}