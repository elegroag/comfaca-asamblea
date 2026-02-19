import { BackboneModel } from "@/common/Bone";

interface RechazoAttributes {
    id?: number | null;
    nit?: number;
    cedula_representa?: number;
    nombre_representa?: string;
    telefono?: number;
    email?: string;
    razsoc?: string;
    criterio?: number;
    tipo_criterio?: string;
    criterios?: any[];
}

interface RechazoOptions {
    [key: string]: any;
}

export default class RechazoModel extends BackboneModel {
    constructor(options: RechazoOptions = {}) {
        super(options);
    }

    get idAttribute(): string {
        return 'id';
    }

    get defaults(): RechazoAttributes {
        return {
            id: null,
            nit: 0,
            cedula_representa: 0,
            nombre_representa: undefined,
            telefono: 0,
            email: undefined,
            razsoc: undefined,
            criterio: 0,
            tipo_criterio: undefined,
            criterios: [],
        };
    }
}
