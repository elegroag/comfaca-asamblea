import { BackboneCollection } from "@/common/Bone";
import RechazoModel from "./RechazoModel";

interface RechazosCollectionOptions {
    [key: string]: any;
}

export default class RechazosCollection extends BackboneCollection {
    constructor(options: RechazosCollectionOptions = {}) {
        super(options);
    }

    get model() {
        return RechazoModel;
    }
}
