'use strict';

import { BackboneCollection } from "@/common/Bone";
import Representante from "@/models/Representante";

class RepresentantesCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/recepcion/all_representantes' });
    }

    get model() {
        return Representante;
    }
}

export default RepresentantesCollection;
