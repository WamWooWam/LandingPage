import { ActivatedDeferral } from "./ActivatedDeferral";
import { ActivatedDeferralV1 } from "../../subsystems";
import { CoreApplication } from "../../Core/CoreApplication";
import { uuidv4 } from "../../helpers";

export class ActivatedOperation {
    private __deferral: ActivatedDeferral;
    getDeferral(): ActivatedDeferral {
        if (this.__deferral)
            return this.__deferral;

        let deferralId = uuidv4();
        this.__deferral = new ActivatedDeferral(deferralId);

        let application = CoreApplication.current;
        application.postMessage({ type: ActivatedDeferralV1, data: { deferralId, type: 'captured' } });
        
        return this.__deferral;
    }
}