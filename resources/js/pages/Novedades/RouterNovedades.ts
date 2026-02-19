import { BackboneRouter } from "@/common/Bone";
import NovedadesController from "./NovedadesController";
import $App from "@/core/App";

declare global {
    var $App: any;
}

interface RouterNovedadesOptions {
    [key: string]: any;
}

export default class RouterNovedades extends BackboneRouter {
    controller: NovedadesController;

    constructor(options: RouterNovedadesOptions = {}) {
        super({
            routes: {
                '': 'listarNovedades',
                listar: 'listarNovedades',
                'detalle/:id': 'detalleNovedad',
            },
            ...options,
        });

        this.controller = $App.startSubApplication(NovedadesController, this);
        this._bindRoutes();
    }

    /**
     * Listar novedades
     */
    listarNovedades(): void {
        console.log('RouterNovedades.listarNovedades() called');

        if (this.controller && typeof this.controller.listarNovedades === 'function') {
            this.controller.listarNovedades();
        }
    }

    /**
     * Mostrar detalle de novedad
     */
    detalleNovedad(id: string): void {
        console.log('RouterNovedades.detalleNovedad() called', id);

        if (id === '' || id === undefined || id === null) {
            this.navigate('listar', { trigger: true });
            return;
        }

        if (this.controller && typeof this.controller.detalleNovedad === 'function') {
            this.controller.detalleNovedad(id);
        }
    }
}
