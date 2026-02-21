
import { BackboneCollection } from "@/common/Bone";
import Usuario from "@/models/Usuario";

class UsuariosCollection extends BackboneCollection {
    constructor(options?: any) {
        super({ ...options, url: '/web/admin/all_usuarios' });
    }

    get model() {
        return Usuario;
    }
}

export default UsuariosCollection;
