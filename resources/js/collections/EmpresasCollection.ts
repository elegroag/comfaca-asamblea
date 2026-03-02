'use strict';

import { BackboneCollection } from "@/common/Bone";
import Empresa from "@/models/Empresa";
import { CollectionOptions } from "@/types/CommonDeps";

class EmpresasCollection extends BackboneCollection {
    url: string;

    constructor(options?: CollectionOptions) {
        super(options);
        this.url = '/api/habil/listar';
    }

    get model(): typeof Empresa {
        return Empresa;
    }

}

export default EmpresasCollection;
