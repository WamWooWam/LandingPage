import AnimationLayer from "./AnimationLayer";

export default interface Animation {
    layers: AnimationLayer[];
    duration: number;
    tick: (time: number) => any;
}

