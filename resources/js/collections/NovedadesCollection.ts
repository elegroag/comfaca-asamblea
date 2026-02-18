'use strict';

import { BackboneCollection } from "@/common/Bone";
import Novedad from "@/models/Novedad";

class NovedadesCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/novedades/listar' });
    }

    get model() {
        return Novedad;
    }
}

export default NovedadesCollection;
