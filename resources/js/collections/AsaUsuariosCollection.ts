'use strict';

import { BackboneCollection } from "@/common/Bone";
import AsaUsuario from "@/models/AsaUsuario";

class AsaUsuariosCollection extends BackboneCollection {
    constructor(options: any) {
        super({ ...options, url: '/web/admin/all_usuarios_asa' });
    }

    get model(): any {
        return AsaUsuario;
    }
}

export default AsaUsuariosCollection;
