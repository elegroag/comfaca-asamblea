'use strict';

import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Asamblea extends BackboneModel {
    get defaults() {
        return {
            id: 0,
            estado: void 0,
            fecha_programada: void 0,
            create_at: void 0,
            update_at: void 0,
        };
    }
    validate(attr: any) {
        const errors: { [key: string]: any }[] = [];
        var _erro = Testeo.identi(attr.nit1, 'apoderado_nit', 7, 20);
        if (_erro) errors.push({ apoderado_nit: _erro });
        return errors.length ? errors : null;
    }
}

export default Asamblea;
