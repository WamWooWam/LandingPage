import { ActivatedOperation } from "./ActivatedOperation";
import { ActivationKind } from "./ActivationKind";

export class LaunchActivatedEventArgs {
    public readonly kind: ActivationKind = ActivationKind.launch;
    public readonly activatedOperation: ActivatedOperation;

    constructor(kind: ActivationKind) {
        this.kind = kind;
        this.activatedOperation = new ActivatedOperation();
    }
}