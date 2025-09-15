import ConfigurationManager, { AppStatus } from "~/Data/ConfigurationManager";
import { Package, PackageApplication, TileSize } from "@landing-page/shared";
import { getTileSize, useTileSize } from "./TileUtils";
import { useContext, useEffect, useState } from "preact/hooks";

import PackageRegistry from "~/Data/PackageRegistry";
import TileBadge from "./TileBadge";
import { TileBranding } from "./TileBranding";
import TileDefaultVisual from "./TileDefaultVisual";
import TileUpdateManager from "./TileUpdateManager";
import TileVisual from "~/Data/TileVisual";
import TileVisualRenderer from "./TileVisualRenderer";
import { createContext } from "preact";
import { lightenDarkenColour2 } from "shared/ColourUtils";
import { useSignal } from "@preact/signals";

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

const TileContext = createContext<TileContextData>(null);

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
    let app = pack?.applications[appId];
    if (!app) console.warn(`App ${appId} in package ${packageName} not found!`);
    return { pack, app };
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
        }, 10000 + (Math.random() * 5000));

        return () => {
            clearInterval(interval);
        }
    }, [visuals]);

    if (!pack || !app) {
        return (
            <div></div>
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
                    <TileVisualRenderer app={app} binding={frontBinding} size={size} />
                </div>
                {swapping.value &&
                    <div class="next" key={nextKey} style={frontStyle} onAnimationEnd={onAnimationEnded}>
                        <TileVisualRenderer app={app} binding={nextBinding} size={size} />
                    </div>
                }

                {size !== TileSize.square70x70 &&
                    <TileBranding branding={visual.branding}
                        nextBranding={nextVisual?.branding}
                        previousBranding={previousVisual?.branding}
                        size={size}
                        visualElements={app.visualElements} />}
            </div>

            <TileBadge isError={appStatus && appStatus.statusCode !== 0} />

            <div className="tile-border"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
        </>
    )
}

export const useTileInfo = () => {
    return useContext(TileContext);
}

export default function TileRenderer({ packageName, appId, row, column, style, size }: TileProps) {
    const [pressState, setPressState] = useState<PressState>("none");
    const [appStatus, setAppStatus] = useState<AppStatus>(null);
    const [availableVisuals, setAvailableVisuals] = useState<Map<TileSize, TileVisual[]>>(new Map());
    const [visuals, setVisuals] = useState<TileVisual[]>([]);

    const { pack, app } = getAppAndPackage(packageName, appId);

    const containerStyle: any = {
        'grid-row-start': row !== undefined ? (row + 1).toString() : undefined,
        'grid-column-start': column !== undefined ? (column + 1).toString() : undefined,
        opacity: "1",
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
            var distanceToPositive = { x: offsetX, y: offsetY }
            var distanceToNegative = { x: (tileSize.width - offsetX), y: (tileSize.height - offsetY) }

            let smallestX = Math.min(distanceToPositive.x, distanceToNegative.x);
            let smallestY = Math.min(distanceToPositive.y, distanceToNegative.y);
            let smallestDistance = Math.min(smallestX, smallestY);

            if (smallestDistance == distanceToPositive.x)
                setPressState("left");
            else if (smallestDistance == distanceToNegative.x)
                setPressState("right");
            else if (smallestDistance == distanceToNegative.y)
                setPressState("bottom");
            else
                setPressState("top");
        }
    }

    const onMouseDown = (e: MouseEvent) => {
        updatePressState(e);
    };

    const onMouseUp = (e: MouseEvent) => {
        setPressState("none");
    }

    const onClick = (e: MouseEvent) => {
    }

    const didGetVisuals = (newVisuals: Map<TileSize, TileVisual[]>) => {
        setAvailableVisuals(newVisuals);
    }

    useEffect(() => {
        const visualsForSize = availableVisuals.get(size) ?? [];
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
            <a id={`${packageName}!${appId}`}
                class={classList.join(" ")}
                style={containerStyle}
                onMouseDown={onMouseDown}
                onMouseUp={onMouseUp}
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
        </TileContext.Provider>
    )
}