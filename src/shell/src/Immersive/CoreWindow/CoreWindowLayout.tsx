import { useState, useEffect, useCallback } from "preact/hooks";

import CoreWindowLayoutManager, { CoreWindowLayoutKind } from "~/Data/CoreWindowLayoutManager";

import CoreWindow from "~/Data/CoreWindow";
import CoreWindowLayoutSeparator from "./CoreWindowLayoutSeparator";
import CoreWindowRenderer from "./CoreWindowRenderer";
import Events from "~/Events";

interface CoreWindowLayoutProps {
}

export default function CoreWindowLayout(_props: CoreWindowLayoutProps) {
    const [windows, setWindows] = useState<CoreWindow[]>([]);
    const [rawWindows, setRawWindows] = useState<CoreWindow[]>([]);
    const [layout, setLayout] = useState<CoreWindowLayoutKind>(CoreWindowLayoutKind.fullScreen);

    const onLayoutUpdated = useCallback(() => {
        const manager = CoreWindowLayoutManager.getInstance()
        const layoutInfo = manager.getLayoutInfo();
        const filteredWindows = [...layoutInfo.windows.filter(w => w)]
        if (filteredWindows.length === 0) {
            Events.getInstance()
                .dispatchEvent(new CustomEvent("start-show-requested"));
        }

        setWindows(filteredWindows);
        setRawWindows(layoutInfo.windows);
        setLayout(layoutInfo.state);
    }, []);

    const onBackdropClicked = useCallback(() => {
        Events.getInstance()
            .dispatchEvent(new CustomEvent("start-show-requested"));
    }, []);

    useEffect(() => {
        const events = Events.getInstance();
        events.addEventListener("layout-updated", onLayoutUpdated);
        events.addEventListener("core-window-visibility-changed", onLayoutUpdated);

        return () => {
            events.removeEventListener("layout-updated", onLayoutUpdated);
            events.removeEventListener("core-window-visibility-changed", onLayoutUpdated);
        };
    }, [onLayoutUpdated]);

    const separatorX = rawWindows[0]?.right ?? (rawWindows[1]?.left - 22);
    const separatorY = 0;

    return (
        <div class="core-window-layout" onClick={onBackdropClicked}>
            {windows.map((l, i) => <CoreWindowRenderer key={l.id} id={l.id} isLaunching={false} visible={l.visible} />)}
            {layout === CoreWindowLayoutKind.split &&
                <CoreWindowLayoutSeparator x={separatorX} y={separatorY} />}
        </div>
    );
}