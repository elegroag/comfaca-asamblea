import { BackboneRouter } from "@/common/Bone";
import AsambleaController from "./AsambleaController";
import $App from "@/core/App";

declare global {
    var $App: any;
}

interface RouterAsambleaOptions {
    [key: string]: any;
}

export default class RouterAsamblea extends BackboneRouter {
    controller: AsambleaController | null = null;

    constructor(options: RouterAsambleaOptions = {}) {
        super({
            routes: {
                '': 'asambleaActiva',
                'asamblea': 'asambleaActiva',
                'listar_asambleas': 'listarAsambleas',
                'asamblea_detalle/:id': 'asambleaDetalle',
            },
            ...options,
        });

        this._bindRoutes();
    }

    init() {
        this.controller = $App.startSubApplication(AsambleaController);
    }

    /**
     * Mostrar detalle de asamblea
     */
    asambleaDetalle(id: string): void {
        this.init();
        console.log('RouterAsamblea.asambleaDetalle() called', id);

        if (id === '' || id === undefined || id === void 0) {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('warning', 'El id de la asamblea es requerido.');
            }
            this.navigate('asamblea', { trigger: true });
            return;
        }

        if (this.controller && typeof this.controller.asambleaDetalle === 'function') {
            this.controller.asambleaDetalle(id);
        }
    }

    /**
     * Listar asambleas
     */
    listarAsambleas(): void {
        this.init();
        console.log('RouterAsamblea.listarAsambleas() called');

        if (this.controller && typeof this.controller.listarAsambleas === 'function') {
            this.controller.listarAsambleas();
        }
    }

    /**
     * Mostrar asamblea activa
     */
    asambleaActiva(): void {
        this.init();
        console.log('RouterAsamblea.asambleaActiva() called');

        if (this.controller && typeof this.controller.asambleaActiva === 'function') {
            this.controller.asambleaActiva();
        }
    }
}
