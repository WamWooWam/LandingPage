import { Component, RenderableProps, createContext } from "preact";
import { TileGroup } from "./Start/TileGroup";
import { parseLayout, StartTileGroup } from "../../shared/StartLayoutParser";
import ShowAllApps from "../static/start/down-arrow.svg"
import StartLayout from '../../packages/StartScreen.xml'
import "./start.css"
import { useContext } from "preact/hooks";
import { MobileContext } from "./Root";

interface StartState {
    tileGroups: Array<StartTileGroup>
}

export class Start extends Component<{}, StartState> {

    componentWillMount() {
        this.setState({ tileGroups: parseLayout(StartLayout) });
    }

    render() {
        const isMobile = useContext(MobileContext);

        return (
            <div class="start start-screen">
                <div class="start-content">
                    {!isMobile &&
                        <div class="start-header start-main-header">
                            <h1 class="start-title">Start</h1>
                        </div>
                    }

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