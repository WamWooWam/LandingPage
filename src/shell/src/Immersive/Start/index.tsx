import "./start.scss"

import { parseLayout } from "@landing-page/shared";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";

import AllAppsButton from "./AllAppsButton";
import Avatar from "static/wam-circular.webp"
import AvatarAvif from "static/wam-circular.avif"
import AvatarPng from "static/wam-circular.png"
import Events from "~/Events";
import HeaderButton from "./HeaderButton";
import PickImage from "~/Util/PickImage";
import PowerIcon from "./PowerIcon";
import SearchIcon from "./SearchIcon";
import StartScrollContainer from "./StartScrollContainer";

interface StartProps { layoutString: string };

const Start = ({ layoutString }: StartProps) => {
    const tileGroups = useMemo(() => parseLayout(layoutString), [layoutString]);
    const firstRender = useRef(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
    }, []);

    useEffect(() => {
        const onShow = () => setVisible(true);
        const onHide = () => setVisible(false);

        Events.getInstance()
            .addEventListener("app-launch-requested", onHide);
        Events.getInstance()
            .addEventListener("start-show-requested", onShow)

        return () => {
            Events.getInstance()
                .removeEventListener("app-launch-requested", onHide);
            Events.getInstance()
                .removeEventListener("start-show-requested", onShow);
        }
    }, []);

    const visibleClass = firstRender.current ? "animate-open-login" : "animate-open";
    const classes = ["start", (visible ? visibleClass : "animate-close")].join(" ");

    return (
        <div class={classes}>
            <div class={"start-screen"}>
                <div class="start-content">
                    <div class="start-header start-main-header">
                        <h1 class="start-title">Start</h1>
                        <div class="start-header-buttons">
                            <HeaderButton primaryClass="start-header-user-button" label="User">
                                <div class="username">
                                    <p class="primary">Thomas</p>
                                    <p class="secondary">May</p>
                                </div>
                                <PickImage webp={Avatar} png={AvatarPng} avif={AvatarAvif}>
                                    {image => <img class="start-header-user-picture" src={image} alt="Photo of Wam" />}
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

                    <StartScrollContainer tileGroups={tileGroups} />

                    <div class="start-footer">
                        <AllAppsButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Start;