'use strict';

import { BackboneCollection } from "@/common/Bone";
import Mesa from "@/models/Mesa";

class MesasCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/admin/all_mesas' });
    }

    get model() {
        return Mesa;
    }
}

export default MesasCollection;
