'use strict';

import { BackboneCollection } from "@/common/Bone";
import Empresa from "@/models/Empresa";

class EmpresasCollection extends BackboneCollection {
    constructor(options?: any) {
        super({ ...options, url: '/web/habil/listar' });
    }

    get model() {
        return Empresa;
    }
}

export default EmpresasCollection;
