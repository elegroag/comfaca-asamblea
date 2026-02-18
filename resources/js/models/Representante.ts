'use strict';

import { BackboneModel } from "@/common/Bone";

class Representante extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    initialize() { }

    get urlRoot() {
        return '/representantes/show';
    }

    get idAttribute() {
        return 'cedrep';
    }

    get defaults() {
        return {
            cedrep: void 0,
            email: '',
            direccion: '',
            segnom: '',
            segape: '',
            prinom: '',
            priape: '',
            asistente: void 0,
        };
    }

    validate() {
        const errors: { [key: string]: any }[] = [];
        return errors.length ? errors : null;
    }
}

export default Representante;
