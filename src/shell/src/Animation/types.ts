export type TimedEasingFunction = (time: number, start: number, end: number, duration: number) => number;
export type EasingFunction = (time: number) => number;
export type AnimationValue = number | (() => number);