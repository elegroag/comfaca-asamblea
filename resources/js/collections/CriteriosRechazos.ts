'use strict';

import { BackboneCollection } from "@/common/Bone";
import CriterioRechazo from "@/models/CriterioRechazo";

class CriteriosRechazos extends BackboneCollection {
    constructor(options?: any) {
        super({ ...options, url: '/web/recepcion/all_criterios_rechazos' });
    }

    get model() {
        return CriterioRechazo;
    }
}

export default CriteriosRechazos;
