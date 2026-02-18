'use strict';

import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Usuario extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    initialize() { }

    get idAttribute() {
        return 'usuario';
    }

    get defaults() {
        return {
            usuario: void 0,
            cedtra: void 0,
            nombre: void 0,
            tipfun: void 0,
            estado: void 0,
            clave: void 0,
        };
    }

    validate(attr: any) {
        const errors: { [key: string]: any }[] = [];
        let _erro;
        _erro = Testeo.identi(attr.cedtra, 'cedtra', 7, 20);
        if (_erro) errors.push({ cedtra: _erro });

        _erro = Testeo.numerico(attr.usuario, 'usuario');
        if (_erro) errors.push({ usuario: _erro });

        _erro = Testeo.vacio(attr.nombre, 'nombre');
        if (_erro) errors.push({ nombre: _erro });

        return errors.length ? errors : null;
    }
}

export default Usuario;
