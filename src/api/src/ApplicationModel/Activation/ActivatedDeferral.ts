import { ActivatedDeferralV1 } from "../../subsystems";
import { CoreApplication } from "../../Core/CoreApplication";

export class ActivatedDeferral {
    private __deferralId: string;
    constructor(deferralId: string) {
        this.__deferralId = deferralId;
    }

    complete(): void {
        const application = CoreApplication.current;
        application.postMessage({ type: ActivatedDeferralV1, data: { deferralId: this.__deferralId, type: 'completed' } });
    }
}
