import { Component, RenderableProps } from "preact";
import { TileGroup } from "./Start/TileGroup";
import { parseLayout, StartTileGroup } from "../../shared/StartLayoutParser";
import ShowAllApps from "../static/start/down-arrow.svg"
import StartLayout from '../../shared/static/StartScreen.xml'
import "./start.css"

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

interface StartState {
    tileGroups: Array<StartTileGroup>
}

export class Start extends Component<{}, StartState> {

    componentDidMount() {
        this.setState({ tileGroups: parseLayout(StartLayout) });
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