
import { BackboneCollection } from "@/common/Bone";
import Interventor from "@/models/Interventor";


class InterventoresCollection extends BackboneCollection {
    constructor(options?: any) {
        super({ ...options, url: '/web/interventores/all' });
    }

    get model() {
        return Interventor;
    }
}

export default InterventoresCollection;
