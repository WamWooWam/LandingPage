import { AppInstance, CoreWindow } from "../Shared";

export default async (instance: AppInstance, window: CoreWindow) => {
    // just to make it animate smoothly, browsers get sad when loading iframes
    await new Promise((resolve) => setTimeout(resolve, 1000))
        .then(() => new Promise<void>((resolve, reject) => {
            const iframe = document.createElement("iframe");
            iframe.src = "https://wamwoowam.github.io/sonic4/";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.style.position = "absolute";
            iframe.style.top = "0";
            iframe.style.left = "0";

            iframe.onload = () => {
                resolve();
            }

            iframe.onerror = () => {
                reject();
            }

            window.view.appendChild(iframe);
        }))

}