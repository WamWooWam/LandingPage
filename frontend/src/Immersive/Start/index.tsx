import "./start.scss"

import { StartTileGroup, parseLayout } from "shared/StartLayoutParser";

import AllAppsButton from "./AllAppsButton";
import Avatar from "static/wam-circular.webp"
import AvatarAvif from "static/wam-circular.avif"
import AvatarPng from "static/wam-circular.png"
import { Component } from "preact";
import Events from "~/Events";
import HeaderButton from "./HeaderButton";
import LayoutState from "~/Data/LayoutState";
import { LayoutStateContext } from "~/Root";
import PickImage from "~/Util/PickImage";
import PowerIcon from "./PowerIcon";
import SearchIcon from "./SearchIcon";
import StartLayout from 'packages/StartScreen.xml'
import StartLayoutMobile from "packages/MobileStartScreen.xml"
import StartScrollContainer from "./StartScrollContainer";

interface StartState {
    tileGroups: Array<StartTileGroup>
    visible: boolean
}


export default class Start extends Component<{}, StartState> {

    constructor() {
        super();
        this.state = { tileGroups: parseLayout(StartLayoutMobile), visible: true };
    }

    componentDidMount(): void {
        Events.getInstance()
            .addEventListener("app-launch-requested", this.hide.bind(this));

        Events.getInstance()
            .addEventListener("start-show-requested", this.show.bind(this))
    }

    componentWillUnmount(): void {

    }

    show() {
        this.setState({ visible: true });
    }

    hide() {
        this.setState({ visible: false })
    }

    render() {
        return (
            <LayoutStateContext.Consumer>
                {layoutState => {
                    const isMobile = layoutState === LayoutState.windowsPhone81;
                    const tiles = parseLayout(isMobile ? StartLayoutMobile : StartLayout);

                    return (
                        <div class={"start" + (!this.state.visible ? " hiding" : "")}>
                            <div class={"start-screen"}>
                                <div class="start-content">
                                    {!isMobile && (
                                        <div class="start-header start-main-header">
                                            <h1 class="start-title">Start</h1>
                                            <div class="start-header-buttons">
                                                <HeaderButton primaryClass="start-header-user-button" label="User">
                                                    <div class="username">
                                                        <p class="primary">Thomas</p>
                                                        <p class="secondary">May</p>
                                                    </div>
                                                    <PickImage webp={Avatar} png={AvatarPng} avif={AvatarAvif}>
                                                        {image => <img class="start-header-user-picture" src={image} alt="Photo of Thomas May" />}
                                                    </PickImage>
                                                </HeaderButton>
                                                <HeaderButton primaryClass="start-header-power" label="Power">
                                                    <PowerIcon width={21} height={21} />
                                                </HeaderButton>
                                                <HeaderButton primaryClass="start-header-search" label="Search">
                                                    <SearchIcon width={21} height={21} />
                                                </HeaderButton>
                                            </div>
                                        </div>
                                    )}

                                    <StartScrollContainer tileGroups={tiles} />

                                    <div class="start-footer">
                                        <AllAppsButton />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }}
            </LayoutStateContext.Consumer>
        )
    }
}