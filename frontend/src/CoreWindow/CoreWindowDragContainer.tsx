import { Component, RefObject, createRef } from "preact";
import { Position } from "../Util";
import CoreWindow from "../Data/CoreWindow";
import AnimationRunner from "../Animation/AnimationRunner";
import Storyboard from "../Animation/Storyboard";
import AnimationEvent from "../Animation/AnimationEvent";
import * as bezier from "bezier-easing";
import CoreWindowLayoutManager from "../Data/CoreWindowLayoutManager";
import { CoreWindowSnapState } from "../Data/CoreWindowSnapState";

interface CoreWindowDragContainerState {
    window: CoreWindow;
    anchor: Position;
    dragState: CoreWindowDragState;
    x: number;
    y: number;
    scaleX: number;
    scaleY: number;
    transformOrigin?: string;
    opacity: number;
    sourceElement?: HTMLElement;
    runner?: AnimationRunner;
}

interface CoreWindowDragContainerProps {
    x: string;
    y: string;
    width: string;
    height: string;
    onMouseMove: Function;
}

enum CoreWindowDragState {
    none,
    dragging,
    closing,
    restoring
}

const EASE_FASTIN = bezier(0.1, 0.9, 0.2, 1.0);
const EASE_DESKTOPWITHPOP = bezier(0.84, 0.21, 0.82, 0.72);

export default class CoreWindowDragContainer extends Component<CoreWindowDragContainerProps, CoreWindowDragContainerState> {
    rootRef: RefObject<HTMLDivElement> = null;

    constructor(props: CoreWindowDragContainerProps) {
        super(props);
        this.state = { window: null, anchor: null, x: 0, y: 0, scaleX: 1, scaleY: 1, dragState: CoreWindowDragState.none, opacity: 1 };
        this.rootRef = createRef();

        this.onPointerMove = this.onPointerMove.bind(this);
        this.onPointerUp = this.onPointerUp.bind(this);
    }

    startWindowDrag(window: CoreWindow, ev: PointerEvent) {
        // calculate the position of the pointer relative to the window
        const pointerPos = { x: ev.clientX, y: ev.clientY };
        const windowPos = window.position;
        const relativePos = { x: pointerPos.x - windowPos.x, y: pointerPos.y - windowPos.y };
        const transformOrigin = `${relativePos.x}px ${relativePos.y}px`;
        let sourceElement = ev.target as HTMLElement;
        this.setState({
            window: window,
            anchor: relativePos,
            x: windowPos.x,
            y: windowPos.y,
            scaleX: 1,
            scaleY: 1,
            opacity: 1,
            transformOrigin: transformOrigin,
            sourceElement
        });


        this.goToState(CoreWindowDragState.dragging);

        // add event listeners to track the pointer
        sourceElement.addEventListener("pointermove", this.onPointerMove);
        sourceElement.addEventListener("pointerup", this.onPointerUp);
        sourceElement.addEventListener("pointercancel", this.onPointerUp);
    }

    endWindowDrag() {
        switch (this.state.dragState) {
            case CoreWindowDragState.closing:
                // close the window
                this.state.window.close();
                break;
        }

        this.setState({ window: null, anchor: null, x: 0, y: 0, scaleX: 1, scaleY: 1, dragState: CoreWindowDragState.none, opacity: 1 });
    }

    goToState(state: CoreWindowDragState) {
        this.setState((oldState) => {
            if (oldState.dragState == state) return null;
            switch (state) {
                case CoreWindowDragState.dragging:
                    this.goToStateDragging();
                    break;
                case CoreWindowDragState.closing:
                    this.goToStateClosing();
                    break;
            }
            return { dragState: state };
        });
    }

    goToStateDragging() {
        // create an animation to scale the window down to 40% of its size
        this.state.runner?.stop();

        var sb = new Storyboard()
            .addLayer("scaleX", this.state.scaleX, 0.4, 0, 0.5, EASE_FASTIN)
            .addLayer("scaleY", this.state.scaleY, 0.4, 0, 0.5, EASE_FASTIN)
            .addLayer("y", this.state.y, window.innerHeight * 0.05, 0, 0.5, EASE_FASTIN)
            .addLayer("opacity", this.state.opacity, 1, 0, 0.5, EASE_FASTIN);

        var runner = new AnimationRunner(sb.createAnimation());
        runner.addEventListener("tick", (e: AnimationEvent) => this.setState({ ...e.values }));
        runner.start();

        this.setState({ runner });
    }

    goToStateClosing() {
        // create an animation to scale the window down to 25% of its size
        this.state.runner?.stop();

        var sb = new Storyboard()
            .addLayer("scaleX", this.state.scaleX, 0.25, 0, 0.66, EASE_FASTIN)
            .addLayer("scaleY", this.state.scaleY, 0.25, 0, 0.66, EASE_FASTIN)
            .addLayer("y", this.state.y, window.innerHeight - ((this.state.window.size.height * 0.25) / 2), 0, 0.66, EASE_FASTIN)
            .addLayer("opacity", this.state.opacity, 0.4, 0, 0.66, EASE_FASTIN);

        var runner = new AnimationRunner(sb.createAnimation());
        runner.addEventListener("tick", (e: AnimationEvent) => this.setState({ ...e.values }));
        runner.start();

        this.setState({ runner });
    }

    onPointerMove(e: PointerEvent) {
        // calculate the new position of the window
        const pointerPos = { x: e.clientX, y: e.clientY };
        const x = pointerPos.x - this.state.anchor.x;
        if (pointerPos.y > window.innerHeight * 0.75) {
            // y is in the bottom 25% of the screen, so snap to the bottom
            this.goToState(CoreWindowDragState.closing);
        }
        else {
            this.goToState(CoreWindowDragState.dragging);
        }

        this.setState({ x });
    }

    onPointerUp(e: PointerEvent) {
        switch (this.state.dragState) {
            case CoreWindowDragState.dragging:
                this.onPointerUpDragging(e);
                break;
            case CoreWindowDragState.closing:
                this.onPointerUpClosing(e);
                break;
        }

        console.log("pointer up");

        // remove event listeners
        this.state.sourceElement.removeEventListener("pointermove", this.onPointerMove);
        this.state.sourceElement.removeEventListener("pointerup", this.onPointerUp);
        this.state.sourceElement.removeEventListener("pointercancel", this.onPointerUp);
        this.state.sourceElement.releasePointerCapture(e.pointerId);
    }

    onPointerUpDragging(e: PointerEvent) {
        this.state.runner?.stop();

        let snap = CoreWindowSnapState.none;
        if (e.clientX < window.innerWidth * 0.25) {
            snap = CoreWindowSnapState.left;
        }
        else if (e.clientX > window.innerWidth * 0.75) {
            snap = CoreWindowSnapState.right;
        }

        CoreWindowLayoutManager.getInstance()
            .snapWindow(this.state.window, snap);

        // fix the transform origin to the center of the window
        const bounds = this.rootRef.current.getBoundingClientRect();
        const initialPosition = { x: bounds.left, y: bounds.top };
        const initialSize = { width: bounds.width, height: bounds.height };

        const targetSize = this.state.window.size;
        const targetPosition = this.state.window.position;

        const initialX = initialPosition.x - (targetSize.width / 2) + (initialSize.width / 2);
        const initialY = initialPosition.y - (targetSize.height / 2) + (initialSize.height / 2);
        const initialScaleX = initialSize.width / targetSize.width;
        const initialScaleY = initialSize.height / targetSize.height;

        const targetX = targetPosition.x;
        const targetY = targetPosition.y;

        const sb = new Storyboard()
            .addLayer("x", initialX, targetX, 0.0, 1, EASE_FASTIN)
            .addLayer("y", initialY, targetY, 0.0, 1, EASE_FASTIN)
            .addLayer("scaleX", initialScaleX, 1, 0.2, 0.8, EASE_FASTIN)
            .addLayer("scaleY", initialScaleY, 1, 0.2, 0.8, EASE_FASTIN)
            .createAnimation();

        var runner = new AnimationRunner(sb, 2 / 3);
        runner.addEventListener("tick", (e: AnimationEvent) => this.setState({ ...e.values }));
        runner.addEventListener("complete", (e: AnimationEvent) => {
            this.setState({ dragState: CoreWindowDragState.none });
        });
        runner.start();

        this.setState({
            dragState: CoreWindowDragState.restoring,
            transformOrigin: `center`,
            x: initialX,
            y: initialY,
            scaleX: initialScaleX,
            scaleY: initialScaleY,
            runner
        });
    }

    onPointerUpClosing(e: PointerEvent) {
        // create an animation to scale the window down to 25% of its size
        var sb = new Storyboard()
            .addLayer("scaleX", this.state.scaleX, 0.20, 0, 0.5, EASE_FASTIN)
            .addLayer("scaleY", this.state.scaleY, 0.20, 0, 0.5, EASE_FASTIN)
            .addLayer("y", this.state.y, window.innerHeight - ((this.state.window.size.height * 0.25) / 2), 0, 0.5, EASE_FASTIN)
            .addLayer("opacity", this.state.opacity, 0, 0, 0.5, EASE_FASTIN);

        var runner = new AnimationRunner(sb.createAnimation());
        runner.addEventListener("tick", (e: AnimationEvent) => this.setState({ ...e.values }));
        runner.addEventListener("complete", (e: AnimationEvent) => this.endWindowDrag());
        runner.start();
    }

    render() {
        let style = {};
        let className = "core-window"

        if (this.state.dragState === CoreWindowDragState.none) {
            style = {
                left: this.props.x,
                top: this.props.y,
                width: this.props.width,
                height: this.props.height,
            };
        }
        else {
            style = {
                border: "1px solid #555555",
                position: 'absolute',
                width: this.state.window.size.width + "px",
                height: this.state.window.size.height + "px",
                transformOrigin: this.state.transformOrigin,
                transform: `translate3d(${this.state.x}px, ${this.state.y}px, 0px) scale(${this.state.scaleX}, ${this.state.scaleY})`,
                opacity: this.state.opacity,
                zIndex: 2000
            };
        }

        return (
            <div ref={this.rootRef} class={className} style={style} onMouseMove={(e) => this.props.onMouseMove(e)}>
                {this.props.children}
            </div>
        )
    }
}