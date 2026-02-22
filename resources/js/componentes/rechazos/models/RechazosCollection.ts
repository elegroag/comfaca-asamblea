import { BackboneCollection } from "@/common/Bone";
import RechazoModel from "./RechazoModel";


export default class RechazosCollection extends BackboneCollection {
    constructor(options?: any) {
        super(options);
    }

    get model() {
        return RechazoModel;
    }
}
