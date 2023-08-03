import { Component, RefObject, createRef } from "preact";
import { useContext } from "preact/hooks";
import { LayoutStateContext } from "../Root";
import { StartTileGroup, parseLayout } from "shared/StartLayoutParser";
import LayoutState from "../LayoutState";
import AllAppsButton from "./AllAppsButton";
import StartScrollContainer from "./StartScrollContainer";
import HeaderButton from "./HeaderButton";
import PowerIcon from "./PowerIcon";
import SearchIcon from "./SearchIcon";

import StartLayout from '../../../packages/StartScreen.xml'
import StartLayoutMobile from "../../../packages/MobileStartScreen.xml"
import Avatar from "../../static/wam.webp"

import "./start.scss"

type FullscreenDocument = Document & {
    webkitFullscreenElement?: Element,
    msFullscreenElement?: Element,
    mozFullScreenElement?: Element,
    webkitExitFullscreen?: Function,
    msExitFullscreen?: Function,
    mozCancelFullScreen?: Function
};
type FullscreenElement = HTMLElement & {
    webkitRequestFullscreen?: Function,
    msRequestFullscreen?: Function,
    mozRequestFullScreen?: Function
};

interface StartState {
    tileGroups: Array<StartTileGroup>
}

export default class Start extends Component<{}, StartState> {

    constructor() {
        super();
        this.state = { tileGroups: parseLayout(StartLayoutMobile) };
    }

    render() {
        const isMobile = useContext(LayoutStateContext) === LayoutState.windowsPhone81;
        const tiles = parseLayout(isMobile ? StartLayoutMobile : StartLayout);

        return (
            <div class="start start-screen">
                <div class="start-content">
                    {!isMobile &&
                        <div class="start-header start-main-header">
                            <h1 class="start-title" role="button">Start</h1>
                            <div class="start-header-buttons">
                                <HeaderButton primaryClass="start-header-user-button" label="User">
                                    <div class="username">
                                        <p class="primary">Thomas</p>
                                        <p class="secondary">May</p>
                                    </div>
                                    <img class="start-header-user-picture" src={Avatar} alt="Photo of Thomas May" />
                                </HeaderButton>
                                <HeaderButton primaryClass="start-header-power" label="Power">
                                    <PowerIcon width={21} height={21} />
                                </HeaderButton>
                                <HeaderButton primaryClass="start-header-search" label="Search">
                                    <SearchIcon width={21} height={21} />
                                </HeaderButton>
                            </div>
                        </div>
                    }

                    <StartScrollContainer tileGroups={tiles} />

                    <div class="start-footer">
                        <AllAppsButton />
                    </div>
                </div>
            </div>
        )
    }
}