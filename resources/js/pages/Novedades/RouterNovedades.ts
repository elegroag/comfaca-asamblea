import { BackboneRouter } from "@/common/Bone";
import NovedadesController from "./NovedadesController";
import { CommonDeps } from "@/types/CommonDeps";

interface RouterNovedadesOptions extends Partial<CommonDeps> {
    region?: any;
}

export default class RouterNovedades extends BackboneRouter {
    private controller: NovedadesController | null = null;

    constructor(options: RouterNovedadesOptions = {}) {
        super({
            routes: {
                '': 'listarNovedades',
                listar: 'listarNovedades',
                'detalle/:id': 'detalleNovedad',
            },
            ...options,
        });

        this._bindRoutes();
    }

    listarNovedades(): void {
        if (this.controller && typeof this.controller.listarNovedades === 'function') {
            this.controller.listarNovedades();
        }
    }

    detalleNovedad(id: string): void {
        if (this.controller && typeof this.controller.detalleNovedad === 'function') {
            this.controller.detalleNovedad(id);
        }
    }
}
