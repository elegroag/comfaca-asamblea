'use strict';

import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Consenso extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    get idAttribute() {
        return 'id';
    }

    initialize() { }

    get defaults() {
        return {
            id: void 0,
            asamblea_id: 0,
            estado: void 0,
            detalle: void 0,
            hora_inicia: void 0,
            hora_cierre_votaciones: void 0,
            create_at: void 0,
            update_at: void 0,
        };
    }

    validate(attrs: any) {
        const errors: { [key: string]: any }[] = [];
        let _erro = Testeo.identi(attrs.asamblea_id, 'asamblea_id', 7, 20);
        if (_erro) errors.push({ asamblea_id: _erro });
        return errors.length ? errors : null;
    }
}

export default Consenso;
