import { render } from "preact";
import { AppInstance, CoreWindow } from "./Shared";

export default (instance: AppInstance, window: CoreWindow) => {
    return new Promise<void>((resolve, reject) => {
        const frame = <iframe
            src="https://wamwoowam.co.uk/ball/"
            allowFullScreen={true}
            style={{ width: "100%", height: "100%", border: "none", position: "absolute", top: "0", left: "0" }}
            onLoad={() => resolve()}
            onError={() => reject()}
        />

        render(frame, window.view)
    });
}