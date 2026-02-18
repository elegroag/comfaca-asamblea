import { BackboneModel } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";

class Poder extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    initialize() {
        this.forRechazo = false;
    }

    get urlRoot() {
        return '/poder/show';
    }

    get idAttribute() {
        return 'documento';
    }

    get defaults() {
        return {
            documento: 0,
            fecha: '',
            estado: '',
            radicado: 0,
            criterio_rechazo: void 0,
            apoderado_nit: '',
            apoderado_razsoc: '',
            apoderado_repleg: '',
            apoderado_cedrep: '',
            estado_detalle: '',
            id: 0,
            notificacion: '',
            poderdante_nit: '',
            poderdante_razsoc: '',
            poderdante_repleg: '',
            poderdante_cedrep: '',
        };
    }

    validate(attr: any) {
        const errors: { [key: string]: any }[] = [];
        let _erro;

        if (this.forRechazo === true) {
            _erro = Testeo.numerico(attr.criterio_rechazo, 'criterio_rechazo', true, 3);
            if (_erro) errors.push({ criterio_rechazo: _erro });
        } else {
            _erro = Testeo.identi(attr.apoderado_nit, 'apoderado_nit', 4, 20);
            if (_erro) errors.push({ apoderado_nit: _erro });

            _erro = Testeo.identi(attr.poderdante_nit, 'poderdante_nit', 4, 20);
            if (_erro) errors.push({ poderdante_nit: _erro });

            _erro = Testeo.identi(attr.apoderado_repleg, 'apoderado_repleg', 4, 20);
            if (_erro) errors.push({ apoderado_repleg: _erro });

            _erro = Testeo.identi(attr.poderdante_repleg, 'poderdante_repleg', 4, 20);
            if (_erro) errors.push({ poderdante_repleg: _erro });
        }

        _erro = Testeo.identi(attr.radicado, 'radicado', 1, 20);
        if (_erro) errors.push({ radicado: _erro });

        return errors.length ? errors : null;
    }

    setForRechazo(status = false) {
        this.forRechazo = status;
    }
}

export default Poder;
