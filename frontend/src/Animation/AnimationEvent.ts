export default class AnimationEvent extends Event {
    readonly progress: number;
    readonly values: any;

    constructor(progress: number, values: any) {
        super("tick");
        this.progress = progress;
        this.values = values;
    }
}
