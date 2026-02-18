'use strict';

import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class AsaUsuario extends BackboneModel {

    get defaults() {
        return {
            id: 0,
            cedtra: 0,
            rol: void 0,
            estado: void 0,
            create_at: void 0,
            update_at: void 0,
            asamblea_id: 0,
        };
    }
    validate(attr: any) {
        const errors: { [key: string]: any }[] = [];
        var _erro = Testeo.identi(attr.cedtra, 'cedtra', 7, 20);
        if (_erro) errors.push({ cedtra: _erro });
        return errors.length ? errors : null;
    }
}

export default AsaUsuario;
