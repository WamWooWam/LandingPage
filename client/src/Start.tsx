import { Component, RenderableProps, createContext } from "preact";
import { useContext } from "preact/hooks";
import { TileGroup } from "./Tiles/TileGroup";
import { parseLayout, StartTileGroup } from "landing-page-shared";
import { MobileContext } from "./Root";
import "./start.css"

import StartLayout from '../../packages/StartScreen.xml'
import { AllAppsButton } from "./Start/AllAppsButton";

type FullscreenDocument = Document & { webkitFullscreenElement?: Element, msFullscreenElement?: Element, mozFullScreenElement?: Element, webkitExitFullscreen?: Function, msExitFullscreen?: Function, mozCancelFullScreen?: Function };
type FullscreenElement = HTMLElement & { webkitRequestFullscreen?: Function, msRequestFullscreen?: Function, mozRequestFullScreen?: Function };

interface StartState {
    tileGroups: Array<StartTileGroup>
}

export class Start extends Component<{}, StartState> {

    componentWillMount() {
        this.setState({ tileGroups: parseLayout(StartLayout) });
    }

    onStartTitleClick = () => {
        // i hate web browsers
        let doc = document as FullscreenDocument;
        let root = document.documentElement as FullscreenElement;
        let requestFullscreen = root.requestFullscreen || root.webkitRequestFullscreen || root.msRequestFullscreen || root.mozRequestFullScreen;
        let exitFullscreen = doc.exitFullscreen || doc.webkitExitFullscreen || doc.msExitFullscreen || doc.mozCancelFullScreen;

        if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement || doc.mozFullScreenElement) {
            exitFullscreen.call(doc);
        }
        else {
            requestFullscreen.call(root);
        }
    }

    render() {
        const isMobile = useContext(MobileContext);

        return (
            <div class="start start-screen">
                <div class="start-content">
                    {!isMobile &&
                        <div class="start-header start-main-header">
                            <h1 class="start-title" role="button" onClick={this.onStartTitleClick}>Start</h1>
                        </div>
                    }

                    <div class="start-tiles-scroll-container">
                        <div class="start-tiles">
                            {this.state.tileGroups.map(m => <TileGroup {...m} />)}
                        </div>
                    </div>

                    <div class="start-footer">
                        <AllAppsButton/>
                    </div>
                </div>
            </div>
        )
    }
}