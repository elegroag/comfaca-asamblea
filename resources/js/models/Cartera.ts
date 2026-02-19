import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Cartera extends BackboneModel {
    constructor(options?: { [key: string]: any } | null) {
        super(options);
    }

    get urlRoot() {
        return '/cartera/show';
    }

    get idAttribute() {
        return 'id';
    }

    get defaults() {
        return {
            id: null,
            nit: 0,
            concepto: void 0,
            asamblea_id: void 0,
            codigo: void 0,
            cedrep: '',
            repleg: '',
            razsoc: '',
        };
    }

    validate(attrs: any) {
        const errors: { [key: string]: any }[] = [];
        let out: string | false = '';

        if ((out = Testeo.vacio(attrs.nit, 'nit'))) {
            errors.push({ nit: out });
        } else {
            if ((out = Testeo.identi(attrs.nit, 'nit', 6, 16))) {
                errors.push({ nit: out });
            }
        }

        if ((out = Testeo.vacio(attrs.concepto, 'concepto'))) {
            errors.push({ concepto: out });
        }

        if ((out = Testeo.vacio(attrs.codigo, 'codigo'))) {
            errors.push({ codigo: out });
        }
        return _.size(errors) > 0 ? errors : void 0;
    }
}

export default Cartera;
