import "./message-dialog.scss"

import { Component, RefObject, RenderableProps, createRef } from "preact";

import Events from "~/Events";
import MessageDialog from "~/Data/MessageDialog";
import MessageDialogEvent from "~/Events/MessageDialogEvent";
import UICommand from "~/Data/UICommand";

interface MessageDialogRendererState {
    dialog: MessageDialog
    isVisible: boolean;
    isClosing: boolean
}

// TODO: fallback for browsers that don't do <dialog>
export default class MessageDialogRenderer extends Component<{}, MessageDialogRendererState> {
    private ref: RefObject<HTMLDialogElement>

    constructor() {
        super();
        this.state = { isVisible: false, isClosing: false, dialog: null };
        this.ref = createRef<HTMLDialogElement>();
    }

    componentDidMount() {
        if (this.state.isVisible) {
            this.show();
        }

        Events.getInstance()
            .addEventListener("message-dialog-open", this.onMessageDialogOpen.bind(this))
    }

    onMessageDialogOpen(e: MessageDialogEvent) {
        if (this.state.dialog) {
            // don't allow showing more than one dialog at once
            Events.getInstance()
                .dispatchEvent(new MessageDialogEvent({ dialog: this.state.dialog, type: "close", command: null }))
            return;
        }

        this.setState({ dialog: e.detail.dialog });
        this.show();
    }

    show(): void {
        this.setState({ isVisible: true })
        this.ref.current.showModal();
    }

    onCancel(e: Event): void {
        e.preventDefault();
        this.closeDialog();
    }

    onClose(e: Event): void {
        if (this.state.isVisible && this.state.dialog && !this.state.isClosing) {
            e.preventDefault();
            this.closeDialog();
        }
    }

    onAnimationCompleted(): void {
        if (this.state.isClosing) {
            this.ref.current.close();
            this.setState({ dialog: null, isVisible: false, isClosing: false });
        }
    }

    closeDialog(command?: UICommand) {
        Events.getInstance()
            .dispatchEvent(new MessageDialogEvent({ dialog: this.state.dialog, type: "close", command }))

        if (command && command.invoked)
            command.invoked(command);

        this.setState({ isClosing: true })
    }

    render(props: RenderableProps<{}>, state: Readonly<MessageDialogRendererState>) {
        let className = "message-dialog";
        if (state.isClosing)
            className += " closing";
        return (
            <dialog ref={this.ref} className={className} onClose={this.onClose.bind(this)} onCancel={this.onCancel.bind(this)}>
                <div class="message-dialog-content-root" onAnimationEnd={this.onAnimationCompleted.bind(this)}>
                    {(() => {
                        if (!this.state.dialog) return <></>;

                        let titleClass = "message-dialog-title " + (state.dialog.title ? "visible" : "hidden");
                        let contentClass = "message-dialog-content " + (state.dialog.content ? "visible" : "hidden");
                        let commands = state.dialog.commands.map((command, i) => {
                            const classList = i === (state.dialog.commands.length - 1) ? "message-dialog-button primary" : "message-dialog-button";
                            return <button key={i} className={classList} onClick={() => this.closeDialog(command)}>{command.label}</button>;
                        })

                        return (
                            <div className="message-dialog-content-container">
                                <h1 className={titleClass}>{state.dialog.title}</h1>
                                <pre className={contentClass} dangerouslySetInnerHTML={{__html: state.dialog.content}}></pre>
                                <div className="message-dialog-button-container">{commands}</div>
                            </div>
                        )
                    })()}
                </div>
            </dialog>
        )
    }
}