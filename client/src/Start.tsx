import { Component, RenderableProps } from "preact";
import { TileGroup } from "./Start/TileGroup";
import { TileSize } from "./Start/TileSize";
import { TileRenderer } from "./Start/TileRenderer";
import { Package } from "./Data/Package";
import Avatar from "../static/wam.jpg"
import AvatarWebp from "../static/wam.webp"
import AvatarAvif from "../static/wam.avif"

import ShowAllApps from "../static/start/down-arrow.svg"

import "./start.css"
import StartLayout from '../static/StartScreen.xml'


interface StartHeaderButtonProps {
    primaryClass: string
}

const HeaderButton = (props: RenderableProps<StartHeaderButtonProps>) => {
    return (
        <div class={"start-header-button " + props.primaryClass}>
            {props.children}
        </div>
    )
}

interface StartTileGroup {
    title: string;
    tiles: Array<StartTile>;
}

interface StartTile {
    packageName: string;
    appId: string;
    size: TileSize;
    fence: boolean;
}

interface StartState {
    tileGroups: Array<StartTileGroup>
}

export class Start extends Component<{}, StartState> {

    componentDidMount() {
        this.parseLayout(StartLayout);
    }

    parseLayout(text: string) {
        let doc = new DOMParser().parseFromString(text, 'application/xml');
        let root = doc.querySelector("launcher");

        if (root == null) {
            return;
        }

        let tileGroups = [];
        let groups = root.querySelectorAll("group");
        for (let i = 0; i < groups.length; i++) {
            let group = groups[i];
            let groupProps: StartTileGroup = {
                title: group.getAttribute("name"),
                tiles: []
            };

            let tiles = group.querySelectorAll("tile");
            for (let j = 0; j < tiles.length; j++) {
                let tile = tiles[j];
                let rawAppId = tile.getAttribute("AppID");
                let tileProps: StartTile = {
                    packageName: null,
                    appId: null,
                    size: TileSize.square150x150,
                    fence: false
                };

                if (rawAppId !== null) {
                    // parsing windows 8 start screen xml dump
                    console.log(`Parsing AppID ${rawAppId}`);
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

        this.setState({ tileGroups: tileGroups });
    }

    render() {
        return (
            <div class="start start-screen">
                <div class="start-content">
                    <div class="start-header start-main-header">
                        <h1 class="start-title">Start</h1>
                        {/*
                            <div class="start-header-buttons">
                                <HeaderButton primaryClass="start-header-user-button">
                                    <div class="username">
                                        <p class="primary">Thomas</p>
                                        <p class="secondary">May</p>
                                    </div>
                                    <picture class="start-header-user-picture">
                                        <source srcset={AvatarAvif} type="image/avif" />
                                        <source srcset={AvatarWebp} type="image/webp" />
                                        <img src={Avatar} alt="avatar" class="start-header-user-picture" />
                                    </picture>
                                </HeaderButton>
                                <HeaderButton primaryClass="start-header-power">
                                    &#xE07D;
                                </HeaderButton>
                                <HeaderButton primaryClass="start-header-search">
                                    &#xE2FB;
                                </HeaderButton>
                            </div>
                        */}
                    </div>

                    <div class="start-tiles-scroll-container">
                        <div class="start-tiles">
                            {this.state.tileGroups ? this.state.tileGroups.map(m => <TileGroup {...m} />) : []}
                        </div>
                    </div>

                    <div class="start-footer">
                        <div class="start-show-all-button start-arrow-button" role="button">
                            <img src={ShowAllApps} alt="show all" width={32} height={32} draggable={false} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}