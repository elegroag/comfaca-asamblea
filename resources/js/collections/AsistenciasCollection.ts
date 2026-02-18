'use strict';

import { BackboneCollection } from "@/common/Bone";
import Asistencia from "@/models/Asistencia";

class AsistenciasCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/recepcion/all' });
    }

    get model(): any {
        return Asistencia;
    }
}

export default AsistenciasCollection;
