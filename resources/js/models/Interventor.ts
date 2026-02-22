'use strict';

import { BackboneModel } from "@/common/Bone";

class Interventor extends BackboneModel {
    constructor(options: any) {
        super(options);
    }

    initialize() { }

    get urlRoot() {
        return '/interventores/show';
    }

    get idAttribute() {
        return 'cedint';
    }

    get defaults() {
        return {
            cedint: void 0,
            segnom: '',
            segape: '',
            prinom: '',
            priape: '',
        };
    }

    validate() {
        const errors: { [key: string]: any }[] = [];
        return errors.length ? errors : null;
    }
}

export default Interventor;
