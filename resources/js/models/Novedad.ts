'use strict';

import { BackboneModel } from "@/common/Bone";

class Novedad extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    initialize() { }

    get idAttribute() {
        return 'id';
    }

    get defaults() {
        return {
            id: void 0,
            linea: void 0,
            estructura: void 0,
            syncro: 0,
            estado: void 0,
        };
    }

    validate() {
        const errors: { [key: string]: any }[] = [];
        return errors.length ? errors : null;
    }
}

export default Novedad;
