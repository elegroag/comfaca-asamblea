'use strict';

import { BackboneCollection } from "@/common/Bone";
import Cartera from "@/models/Cartera";

class CarterasCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/cartera/listar' });
    }

    get model() {
        return Cartera;
    }
}

export default CarterasCollection;
