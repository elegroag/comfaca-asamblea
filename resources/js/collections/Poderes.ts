'use strict';

import { BackboneCollection } from "@/common/Bone";
import Poder from "@/models/Poder";

class PoderesCollection extends BackboneCollection {
    constructor(options?: any) {
        super({
            ...options,
            url: '/web/poderes/listar'
        });
    }

    get model() {
        return Poder;
    }
}

export default PoderesCollection;
