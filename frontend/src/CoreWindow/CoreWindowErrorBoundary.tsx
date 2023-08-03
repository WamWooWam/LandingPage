import { Component, createContext } from "preact"
import "./core-window-error.scss"

interface CoreWindowErrorBoundaryProps {
    error: Error
}


const CoreWindowErrorContext = createContext<((e: Error) => void)>(() => { });

export default class CoreWindowErrorBoundary extends Component<CoreWindowErrorBoundaryProps, {}> {
    constructor(props: CoreWindowErrorBoundaryProps) {
        super(props)
    }

    render() {
        if (this.props.error) {
            const isConnectionError = (this.props.error.message && (this.props.error.message.match(/Failed to fetch/) || this.props.error.message.match(/Loading CSS chunk/))) || !navigator.onLine;
            return (
                <div className="core-window-error">
                    <div id="contentContainer" class="mainContent">
                        {isConnectionError ?
                            <div id="mainTitle" class="title">You aren&rsquo;t connected</div> :
                            <div id="mainTitle" class="title">This page can&rsquo;t be displayed</div>}
                        <div class="taskSection" id="taskSection">
                            {isConnectionError ?
                                <ul id="notConnectedTasks" class="tasks">
                                    <li id="task2-1">Check that all network cables are plugged in.</li>
                                    <li id="task2-2">Verify that flight mode is turned off.</li>
                                    <li id="task2-3">Make sure that your wireless switch is turned on.</li>
                                    <li id="task2-4">See if you can connect to mobile broadband.</li>
                                    <li id="task2-5">Restart your router.</li>
                                </ul> :
                                <ul id="cantDisplayTasks" class="tasks">
                                    <li id="task1-1">Make sure that the web address <span id="webpage" class="webpageURL">{window.location.href}</span> is correct.</li>
                                    <li id="task1-2">Look for the page with your search engine.</li>
                                    <li id="task1-3">Refresh the page in a few minutes.</li>
                                </ul>
                            }
                        </div>

                        <pre>
                            {this.props.error?.message}
                            {this.props.error?.stack}
                        </pre>
                    </div>
                </div>
            );
        }

        return (
            this.props.children
        );
    }
}