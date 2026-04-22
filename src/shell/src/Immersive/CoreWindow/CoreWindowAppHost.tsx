import { memo } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

import CoreWindow from "~/Data/CoreWindow";

interface CoreWindowAppHostProps {
    window: CoreWindow;
}

const CoreWindowAppHost = memo(({ window }: CoreWindowAppHostProps) => {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (host) {
            host.appendChild(window.view);
        }

        const loadWindow = async () => {
            await window.load();
        };

        loadWindow();

        return () => {
            if (host) {
                try {
                    host.removeChild(window.view);
                } catch (e) {
                    window.view.remove();
                }
            }
        };
    }, [window]);

    return (<div ref={hostRef} className="core-window-app-host"></div>);
});

export default CoreWindowAppHost;