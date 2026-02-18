'use strict';

import { BackboneModel } from "@/common/Bone";

class CriterioRechazo extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    get defaults() {
        return {
            id: void 0,
            detalle: '',
            estatutos: '',
            tipo: '',
        };
    }
}

export default CriterioRechazo;
