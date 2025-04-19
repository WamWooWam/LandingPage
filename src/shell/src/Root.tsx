import "./Test"

import { Component, ComponentChild, RenderableProps, createContext } from "preact";
import { Suspense, lazy } from "preact/compat"

import CharmsBarRenderer from "./Immersive/Charms/CharmsBarRenderer";
import CoreWindowContainer from "./Immersive/CoreWindow/CoreWindowContainer";
import MessageDialogRenderer from "./Immersive/MessageDialog/MessageDialogRenderer";
import PackageRegistry from "./Data/PackageRegistry";
import ScrollStateProvider from "./Immersive/Start/ScrollStateProvider";
import Start from "./Immersive/Start";

interface RootState {
    layout: string;
}

export default class Root extends Component<{}, RootState> {
    constructor(props: {}) {
        super(props);
    }

    componentDidMount() {
        this.loadLayoutAndPackages();
    }

    async loadLayoutAndPackages() {
        const [layout, packages] = await Promise.all([
            fetch("/api/start-screen.xml", { mode: 'no-cors', credentials: 'include' }).then(r => r.text()),
            fetch("/api/packages.json", { mode: 'no-cors', credentials: 'include' }).then(r => r.json()),
        ]);

        for (const key in packages) {
            const pack = packages[key];
            PackageRegistry.registerPackage(pack);
        }

        this.setState({ layout });
    }

    render(props: RenderableProps<{}>, state?: Readonly<RootState>, context?: any): ComponentChild {
        return state.layout && (
            <>
                <ScrollStateProvider>
                    <Start layoutString={this.state.layout} />
                </ScrollStateProvider>

                <CoreWindowContainer />
                <MessageDialogRenderer />
                <CharmsBarRenderer />
            </>
        )
    }
}