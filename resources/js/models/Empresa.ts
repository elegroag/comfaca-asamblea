'use strict';

import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Empresa extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    get urlRoot() {
        return '/habil/show';
    }

    get idAttribute() {
        return 'nit';
    }

    get defaults() {
        return {
            nit: null,
            cedrep: 0,
            repleg: '',
            telefono: 0,
            email: '',
            razsoc: '',
        };
    }

    validate(attrs: any) {
        const errors: { [key: string]: any }[] = [];
        let out: string | false = '';

        if ((out = Testeo.vacio(attrs.cedrep, 'cedrep'))) {
            errors.push({ cedrep: out });
        } else {
            if ((out = Testeo.identi(attrs.cedrep, 'cedrep', 5, 18))) errors.push({ cedrep: out });
        }

        if ((out = Testeo.vacio(attrs.razsoc, 'razsoc', true))) errors.push({ razsoc: out });

        if ((out = Testeo.vacio(attrs.nit, 'nit'))) {
            errors.push({ nit: out });
        } else {
            if ((out = Testeo.identi(attrs.nit, 'nit', 5, 18))) errors.push({ nit: out });
        }

        if ((out = Testeo.vacio(attrs.repleg, 'repleg'))) errors.push({ repleg: out });

        if (!Testeo.vacio(attrs.email, 'email', true)) {
            if ((out = Testeo.email(attrs.email, 'email'))) errors.push({ email: out });
        }
        return errors.length ? errors : null;
    }
}

export default Empresa;
