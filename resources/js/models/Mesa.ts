'use strict';

import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Mesa extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    get idAttribute() {
        return 'id';
    }

    get defaults() {
        return {
            id: 0,
            codigo: void 0,
            cedtra_responsable: 0,
            estado: void 0,
            consenso_id: 0,
            hora_apertura: void 0,
            hora_cierre_mesa: void 0,
            cantidad_votantes: 0,
            cantidad_votos: 0,
            create_at: void 0,
            update_at: void 0,
        };
    }

    validate(attrs: any) {
        const errors: { [key: string]: any }[] = [];
        let _erro = Testeo.identi(attrs.cedtra_responsable, 'cedtra_responsable', 7, 20);
        if (_erro) errors.push({ cedtra_responsable: _erro });
        return errors.length ? errors : null;
    }
}

export default Mesa;
