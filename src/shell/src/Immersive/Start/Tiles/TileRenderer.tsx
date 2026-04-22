import ConfigurationManager, { AppStatus } from "~/Data/ConfigurationManager";
import { Package, PackageApplication, TileSize, lightenDarkenColour2 } from "@landing-page/shared";
import { useCallback, useContext, useEffect, useRef, useState } from "preact/hooks";

import AppLaunchRequestedEvent from "~/Events/AppLaunchRequestedEvent";
import Events from "~/Events";
import MessageDialog from "~/Data/MessageDialog";
import PackageRegistry from "~/Data/PackageRegistry";
import TileBadge from "./TileBadge";
import { TileBranding } from "./TileBranding";
import TileDefaultVisual from "./TileDefaultVisual";
import TileUpdateManager from "./TileUpdateManager";
import TileVisual from "~/Data/TileVisual";
import TileVisualRenderer from "./TileVisualRenderer";
import UICommand from "~/Data/UICommand";
import { createContext } from "preact";
import { getTileSize } from "./TileUtils";
import { useSignal } from "@preact/signals";
import { useMobile } from "~/Util";
import { ErrorBoundary } from "preact-iso";

export interface TileProps {
    packageName?: string;
    appId: string;
    size: TileSize;
    fence?: boolean;
    row?: number,
    column?: number;
    key?: string;
    animColumn?: number;
    style?: any;
}

interface TileContextData {
    pack: Package;
    app: PackageApplication;
    size: TileSize;
}

const TileContext = createContext<TileContextData>(null!);

interface TileInnerProps {
    pack: Package;
    app: PackageApplication;
    visuals: TileVisual[];
    appStatus?: AppStatus
    size: TileSize;
}

type PressState = "none" | "top" | "bottom" | "left" | "right" | "center";

const getAppAndPackage = (packageName: string, appId: string): { pack: Package, app: PackageApplication } => {
    let pack = PackageRegistry.getPackage(packageName);
    if (!pack) console.warn(`Package ${packageName} not found!`);
    let app = pack?.applications?.get(appId);
    if (!app) console.warn(`App ${appId} in package ${packageName} not found!`);
    return { pack: pack!, app: app! };
}

const TileInner = ({ pack, app, visuals, appStatus, size }: TileInnerProps) => {
    const swapping = useSignal<boolean>(false);
    const visualIdx = useSignal<number>(-1);

    const onAnimationEnded = (e: AnimationEvent) => {
        visualIdx.value = (visualIdx.value + 1) % visuals.length;
        swapping.value = false;
    }

    useEffect(() => {
        if (visuals.length <= 1) return;

        swapping.value = true;

        const interval = setInterval(() => {
            swapping.value = true;
        }, 15000 + (Math.random() * 10000));

        return () => {
            clearInterval(interval);
        }
    }, [visuals]);

    useEffect(() => {
        if (visuals.length === 1) {
            swapping.value = true;
        }
    }, [visuals])

    if (!pack || !app) {
        return (
            <div class="tile"></div>
        );
    }

    const tileColour = app.visualElements.backgroundColor ?? "#4617b4";
    const tileColourLight = lightenDarkenColour2(tileColour, 0.05);
    const frontStyle = {
        background: `linear-gradient(to right, ${tileColour}, ${tileColourLight})`
    }

    const idx = visualIdx.value;
    const visual = idx == -1 ? TileDefaultVisual : visuals[idx];
    const nextVisual = visuals[(idx + 1) % visuals.length];
    const previousVisual = visuals[(idx - 1) % visuals.length] ?? TileDefaultVisual;

    const frontBinding = visual?.bindings?.find(f => f.size === size);
    const nextBinding = nextVisual?.bindings?.find(f => f.size === size);

    const frontKey = idx.toString();
    const nextKey = ((idx + 1) % visuals.length).toString();

    return (
        <>
            <div class="tile">
                <div class="front" style={frontStyle} key={frontKey}>
                    <TileVisualRenderer key={frontKey} app={app} binding={frontBinding} size={size} />
                </div>
                {swapping.value &&
                    <div class="next" style={frontStyle} key={nextKey} onAnimationEnd={onAnimationEnded}>
                        <TileVisualRenderer key={nextKey} app={app} binding={nextBinding} size={size} />
                    </div>
                }

                {size !== TileSize.square70x70 &&
                    <TileBranding branding={visual.branding}
                        nextBranding={nextVisual?.branding}
                        previousBranding={previousVisual?.branding}
                        size={size}
                        visualElements={app.visualElements} />}
            </div>

            <TileBadge isError={!!(appStatus && appStatus.statusCode !== 0)} />

            <div className="tile-border"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
        </>
    )
}

export const useTileInfo = () => {
    return useContext(TileContext);
}

export default function TileRenderer({ packageName, appId, row, column, style, size }: TileProps) {
    const root = useRef<HTMLAnchorElement>(null);

    const [pressState, setPressState] = useState<PressState>("none");
    const [appStatus, setAppStatus] = useState<AppStatus>(null!);
    const [availableVisuals, setAvailableVisuals] = useState<Map<TileSize, TileVisual[]>>(new Map());
    const [visuals, setVisuals] = useState<TileVisual[]>([]);
    const [visible, setVisible] = useState<boolean>(true);

    const { pack, app } = getAppAndPackage(packageName!, appId);

    const isMobile = useMobile();

    const containerStyle: any = {
        'grid-row-start': row !== undefined ? (row + 1).toString() : undefined,
        'grid-column-start': column !== undefined ? (column + 1).toString() : undefined,
        ...((!visible) ? { display: "none" } : {}),
        ...((style) ? style : {})
    }

    const classList = ["tile-container", TileSize[size]];
    if (app?.visualElements.foregroundText === "light")
        classList.push("text-light");
    else
        classList.push("text-dark");

    if (appStatus?.statusCode === 0) {
        classList.push("disabled");
    }

    classList.push("press-" + pressState);

    const href = (() => {
        if (!pack || !app)
            return "#";

        let href = app.startPage;
        if (app.shortLink) {
            href = `${app.shortLink}`;
        }
        else if (app.entryPoint) {
            href = app.entryPoint
        }

        if (appStatus?.statusCode !== 0 && appStatus?.unavailable) {
            href = "#";
        }

        return href;
    })();

    const updatePressState = (e: PointerEvent | MouseEvent) => {
        const tileSize = getTileSize(size);
        const offsetX = Math.max(0, Math.min(e.offsetX, tileSize.width));
        const offsetY = Math.max(0, Math.min(e.offsetY, tileSize.height));

        if ((offsetX >= (tileSize.width * 0.30) && offsetX <= (tileSize.width * 0.70)) &&
            (offsetY >= (tileSize.height * 0.30) && offsetY <= (tileSize.height * 0.70))) {
            setPressState("center");
        }
        else {
            // var distanceToPositive = { x: offsetX, y: offsetY }
            let distanceToPositive = [offsetX, offsetY];
            let distanceToNegative = [tileSize.width - offsetX, tileSize.height - offsetY];

            let smallestX = Math.min(distanceToPositive[0], distanceToNegative[0]);
            let smallestY = Math.min(distanceToPositive[1], distanceToNegative[1]);
            let smallestDistance = Math.min(smallestX, smallestY);

            if (smallestDistance == distanceToPositive[0])
                setPressState("left");
            else if (smallestDistance == distanceToNegative[0])
                setPressState("right");
            else if (smallestDistance == distanceToNegative[1])
                setPressState("bottom");
            else
                setPressState("top");
        }
    }

    const onMouseDown = (e: PointerEvent) => {
        // capture the event to get mouseup outside the element
        root.current!.setPointerCapture(e.pointerId);

        updatePressState(e);
    };

    const onMouseUp = (e: PointerEvent) => {
        setPressState("none");

        root.current!.releasePointerCapture(e.pointerId);
    }

    const onClick = (e: MouseEvent) => {
        8
        // todo: move this somewhere else
        if (appStatus?.statusCode != 0) {
            e.preventDefault();

            let dialog = new MessageDialog(
                `There's a problem with ${app.visualElements.displayName}.`,
                "This app can't open",
            );

            dialog.commands.push(new UICommand('Close'));
            dialog.showAsync();
            return;
        }

        updatePressState(e);

        if (isMobile) {
            return;
        }

        if (app.executable) {
            e.preventDefault();

            const bounds = root.current!.getBoundingClientRect();
            const event = new AppLaunchRequestedEvent(
                pack,
                app,
                {
                    tileX: bounds.x,
                    tileY: bounds.y,
                    tileWidth: bounds.width,
                    tileHeight: bounds.height,
                    tileVisual: TileDefaultVisual,
                    tileSize: size
                },
            );

            setVisible(false);

            Events.getInstance()
                .dispatchEvent(event);

            setTimeout(() => setVisible(true), 1000);
        }
    }

    const didGetVisuals = useCallback((newVisuals: Map<TileSize, TileVisual[]>) => {
        console.debug("%s!%s got visuals: %O", pack.identity.packageFullName, app.id, newVisuals)
        setAvailableVisuals(newVisuals);
    }, [])

    useEffect(() => {
        const visualsForSize = availableVisuals.get(size) ?? [];
        console.debug("%s!%s got visuals for size %d: %O", pack.identity.packageFullName, app.id, size, visualsForSize)
        setVisuals(visualsForSize);
    }, [size, availableVisuals]);

    useEffect(() => {
        ConfigurationManager.getAppStatus(app, pack)
            .then((status) => {
                setAppStatus(status);
            });
    }, [app, pack]);

    useEffect(() => {
        TileUpdateManager.getInstance()
            .registerVisualUpdateCallback(app, didGetVisuals);
        return () => {
            TileUpdateManager.getInstance()
                .unregisterVisualUpdateCallback(app, didGetVisuals);
        }
    }, [app, pack]);

    return (
        <TileContext.Provider value={{ pack: pack, app: app, size: size }}>
            <ErrorBoundary onError={(e) => console.log('Error in tile %O', e)}>
                <a ref={root}
                    id={`${packageName}!${appId}`}
                    class={classList.join(" ")}
                    style={containerStyle}
                    onPointerDown={onMouseDown}
                    onPointerUp={onMouseUp}
                    onClick={onClick}
                    title={app?.visualElements.displayName}
                    href={href}
                    target="_blank">
                    <TileInner app={app}
                        pack={pack}
                        size={size}
                        visuals={visuals}
                    />
                </a>
            </ErrorBoundary>
        </TileContext.Provider>
    )
}