export type EasingFunction = (time: number) => number;
export type TimedEasingFunction = (time: number, start: number, end: number, duration: number) => number;
export type AnimationValue = number | (() => number);

export interface Animation {
    layers: AnimationLayer[];
    duration: number;
    tick: (time: number) => any;
}

export interface AnimationLayer {
    name: string;
    startValue: number;
    endValue: number;
    start: number;
    duration: number;
    easing: TimedEasingFunction;
}
