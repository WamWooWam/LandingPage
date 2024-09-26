import Animation from "./Animation";
import { AnimationValue, TimedEasingFunction, EasingFunction } from "./types";

interface StoryboardLayer {
    name: string;
    startValue: AnimationValue;
    endValue: AnimationValue;
    start: number;
    duration: number;
    easing: TimedEasingFunction;
}

export default class Storyboard {
    private layers: StoryboardLayer[];

    constructor() {
        this.layers = [];
    }

    public get duration() {
        return Math.max(...this.layers.map(layer => layer.start + layer.duration));
    }

    public addLayer(name: string, startValue: AnimationValue, endValue: AnimationValue, start: number, duration: number, easing: EasingFunction): Storyboard {
        this.layers.push({
            name,
            startValue,
            endValue,
            start,
            duration,
            easing: this.createTimedEase(easing)
        });

        return this;
    }

    public createAnimation(): Animation {
        let layers = this.layers.map(layer => {
            let startValue = typeof layer.startValue === "function" ? layer.startValue() : layer.startValue;
            let endValue = typeof layer.endValue === "function" ? layer.endValue() : layer.endValue;

            return { ...layer, startValue, endValue };
        });

        return {
            layers: layers,
            duration: this.duration,
            tick: (time: number) => {
                let values = {} as any;
                for (const layer of layers) {
                    let progress = (time - layer.start) / layer.duration;
                    if (progress < 0) {
                        progress = 0;
                    } else if (progress > 1) {
                        progress = 1;
                    }

                    // console.log(layer.name, progress);

                    values[layer.name] = layer.easing(progress, layer.startValue, layer.endValue, 1);
                }
                return values;
            }
        }
    }

    private createTimedEase(func: EasingFunction): TimedEasingFunction {
        return (time: number, start: number, end: number, duration: number) => {
            return start + (end - start) * func(time / duration);
        };
    }
}