import Animation from "./Animation";
import AnimationEvent from "./AnimationEvent";

export default class AnimationRunner {
    private animation: Animation;
    private startTime: number | null;
    private animationFrame: number | null;
    private running: boolean;
    private timeScalar: number;

    private eventTarget: EventTarget = document.createElement('div');

    constructor(animation: Animation, timeScalar: number = 1.0) {
        this.animation = animation;
        this.startTime = null;
        this.animationFrame = null;
        this.running = false;
        this.timeScalar = timeScalar;

        this.run = this.run.bind(this);
    }

    public start() {
        if (!this.running) {
            this.running = true;
            this.animationFrame = requestAnimationFrame(this.run);
        }
    }

    public stop() {
        if (this.running) {
            this.running = false;
            cancelAnimationFrame(this.animationFrame);
        }
    }

    public get isRunning() {
        return this.running;
    }

    private run(time: number) {
        if (this.startTime === null) {
            this.startTime = time;
            this.eventTarget.dispatchEvent(new Event("start"));
        }

        const progress = (time - this.startTime) / (this.animation.duration * (1000 * this.timeScalar));
        if (progress < 1.0) {
            let values = this.animation.tick(progress);
            this.eventTarget.dispatchEvent(new AnimationEvent(progress, values));
            this.animationFrame = requestAnimationFrame(this.run);
        } else {
            let values = this.animation.tick(1.0);
            this.eventTarget.dispatchEvent(new AnimationEvent(progress, values));
            this.running = false;
            this.eventTarget.dispatchEvent(new Event("complete"));
        }
    }

    public addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        this.eventTarget.addEventListener(type, listener, options);
    }

    public removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
        this.eventTarget.removeEventListener(type, listener, options);
    }
}