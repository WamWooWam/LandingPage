import { TimedEasingFunction } from "./types";

export default interface AnimationLayer {
    name: string;
    startValue: number;
    endValue: number;
    start: number;
    duration: number;
    easing: TimedEasingFunction;
}
