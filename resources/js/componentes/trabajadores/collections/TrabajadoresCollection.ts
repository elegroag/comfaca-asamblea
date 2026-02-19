import { BackboneCollection } from "@/common/Bone";

declare global {
    var Trabajador: any;
    var create_url: (path: string) => string;
}

interface TrabajadoresCollectionOptions {
    [key: string]: any;
}

export default class TrabajadoresCollection extends BackboneCollection {
    constructor(options?: TrabajadoresCollectionOptions) {
        super(options);
    }

    /**
     * @override
     */
    get model() {
        return Trabajador;
    }

    get url(): string {
        return create_url('trabajadores/trabajadores');
    }
}
