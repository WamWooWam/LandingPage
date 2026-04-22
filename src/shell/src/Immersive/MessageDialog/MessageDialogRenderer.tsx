import "./message-dialog.scss"

import { useEffect, useRef, useState } from "preact/hooks";

import Events from "~/Events";
import MessageDialog from "~/Data/MessageDialog";
import MessageDialogEvent from "~/Events/MessageDialogEvent";
import UICommand from "~/Data/UICommand";

export default function MessageDialogRenderer() {
    const [dialog, setDialog] = useState<MessageDialog | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const onMessageDialogOpen = (e: MessageDialogEvent) => {
            if (dialog) {
                // don't allow showing more than one dialog at once
                Events.getInstance()
                    .dispatchEvent(new MessageDialogEvent({ dialog: dialog, type: "close" }))
                return;
            }

            setDialog(e.detail.dialog);
            setIsVisible(true);
            // Use setTimeout to ensure the state update is processed and the ref is available
            setTimeout(() => ref.current?.showModal(), 0);
        };

        Events.getInstance().addEventListener("message-dialog-open", onMessageDialogOpen);
        return () => Events.getInstance().removeEventListener("message-dialog-open", onMessageDialogOpen);
    }, [dialog]);

    const closeDialog = (command?: UICommand) => {
        Events.getInstance()
            .dispatchEvent(new MessageDialogEvent({ dialog: dialog!, type: "close", command }));

        if (command && command.invoked)
            command.invoked(command);

        setIsClosing(true);
    };

    const onCancel = (e: Event): void => {
        e.preventDefault();
        closeDialog();
    };

    const onClose = (e: Event): void => {
        if (isVisible && dialog && !isClosing) {
            e.preventDefault();
            closeDialog();
        }
    };

    const onAnimationCompleted = (): void => {
        if (isClosing) {
            ref.current?.close();
            setDialog(null);
            setIsVisible(false);
            setIsClosing(false);
        }
    };

    let className = "message-dialog";
    if (isClosing)
        className += " closing";

    return (
        <dialog ref={ref} className={className} onClose={onClose} onCancel={onCancel}>
            <div class="message-dialog-content-root" onAnimationEnd={onAnimationCompleted}>
                {(() => {
                    if (!dialog) return <></>;

                    let titleClass = "message-dialog-title " + (dialog.title ? "visible" : "hidden");
                    let contentClass = "message-dialog-content " + (dialog.content ? "visible" : "hidden");
                    let commands = dialog.commands.map((command, i) => {
                        const classList = i === (dialog.commands.length - 1) ? "message-dialog-button primary" : "message-dialog-button";
                        return <button key={i} className={classList} onClick={() => closeDialog(command)}>{command.label}</button>;
                    })

                    return (
                        <div className="message-dialog-content-container">
                            <h1 className={titleClass}>{dialog.title}</h1>
                            <pre className={contentClass} dangerouslySetInnerHTML={{ __html: dialog.content! }}></pre>
                            <div className="message-dialog-button-container">{commands}</div>
                        </div>
                    )
                })()}
            </div>
        </dialog>
    );
}