import { TileSize } from "./TileSize";

export interface StartTileGroup {
    title: string;
    tiles: Array<RawTileProps>;
}

export interface RawTileProps {
    packageName: string;
    appId: string;
    size: TileSize;
    fence: boolean;
}

export const parseLayout = (text: string) => {
    const DOMParser = globalThis.DOMParser ?? require('xmldom').DOMParser;

    let doc = new DOMParser().parseFromString(text, 'application/xml');
    let root = doc.getElementsByTagName("launcher")[0];

    if (root == null) {
        return;
    }

    let tileGroups = [];
    let groups = root.getElementsByTagName("group");
    for (let i = 0; i < groups.length; i++) {
        let group = groups[i];
        let groupProps: StartTileGroup = {
            title: group.getAttribute("name")!,
            tiles: []
        };

        let tiles = group.getElementsByTagName("tile");
        for (let j = 0; j < tiles.length; j++) {
            let tile = tiles[j];
            let rawAppId = tile.getAttribute("AppID");
            let tileProps: RawTileProps = {
                packageName: null,
                appId: null,
                size: TileSize.square150x150,
                fence: false
            };

            if (rawAppId !== null) {
                // parsing windows 8 start screen xml dump
                let idx = rawAppId.lastIndexOf("!");
                if (idx === -1) {
                    tileProps.appId = rawAppId;
                }
                else {
                    tileProps.packageName = rawAppId.substring(0, idx);
                    tileProps.appId = rawAppId.substring(idx + 1);
                }

                tileProps.fence = tile.getAttribute("FencePost") === "1";
                tileProps.size = TileSize[tile.getAttribute("size") as keyof typeof TileSize];
            }
            else {
                tileProps.packageName = tile.getAttribute("packageName");
                tileProps.appId = tile.getAttribute("appId");
                tileProps.fence = tile.getAttribute("fence") === "true";
                tileProps.size = TileSize[tile.getAttribute("size") as keyof typeof TileSize];
            }

            groupProps.tiles.push(tileProps);
        }

        tileGroups.push(groupProps);
    }

    return tileGroups;
}