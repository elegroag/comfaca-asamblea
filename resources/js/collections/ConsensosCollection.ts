'use strict';

import { BackboneCollection } from "@/common/Bone";
import Consenso from "@/models/Consenso";

class ConsensosCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/admin/consensos_all' });
    }

    get model() {
        return Consenso;
    }
}

export default ConsensosCollection;
