import { BackboneRouter } from "@/common/Bone";
import ConsensoController from "./ConsensoController";
import $App from "@/core/App";

declare global {
    var $App: any;
}

interface RouterConsensoOptions {
    routes?: Record<string, string>;
    controller?: any;
}

export default class RouterConsenso extends BackboneRouter {
    controller: ConsensoController;

    constructor(options: RouterConsensoOptions = {}) {
        super({
            routes: {
                '': 'listarConsensos',
                'listar': 'listarConsensos',
                'crear': 'formCrearConsenso',
                'editar/:id': 'formEditConsenso',
                'consenso_detalle/:id': 'consensoDetalle',
            },
            ...options,
        });

        this.controller = $App.startSubApplication(ConsensoController, this);
        this._bindRoutes();
    }

    /**
     * Manejar ruta de error
     */
    error(): void {
        console.log('RouterConsenso.error() called');
        if (this.controller && typeof this.controller.error === 'function') {
            this.controller.error();
        }
    }

    /**
     * Listar consensos
     */
    listarConsensos(): void {
        console.log('RouterConsenso.listarConsensos() called');
        if (this.controller && typeof this.controller.listarConsensos === 'function') {
            this.controller.listarConsensos();
        }
    }

    /**
     * Formulario crear consenso
     */
    formCrearConsenso(): void {
        console.log('RouterConsenso.formCrearConsenso() called');
        if (this.controller && typeof this.controller.formCrearConsenso === 'function') {
            this.controller.formCrearConsenso();
        }
    }

    /**
     * Formulario editar consenso
     */
    formEditConsenso(id: string): boolean {
        console.log('RouterConsenso.formEditConsenso() called', id);

        if (!id || id.trim() === '') {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('warning', 'El id del consenso es requerido.');
            }
            this.navigate('listar', { trigger: true });
            return false;
        }

        if (this.controller && typeof this.controller.formEditConsenso === 'function') {
            this.controller.formEditConsenso(id);
            return true;
        } else {
            console.error('Controller.formEditConsenso no está disponible');
            return false;
        }
    }

    /**
     * Detalle del consenso
     */
    consensoDetalle(id: string): boolean {
        console.log('RouterConsenso.consensoDetalle() called', id);

        if (!id || id.trim() === '') {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('warning', 'El id del consenso es requerido.');
            }
            this.navigate('listar', { trigger: true });
            return false;
        }

        if (this.controller && typeof this.controller.consensoDetalle === 'function') {
            this.controller.consensoDetalle(id);
            return true;
        } else {
            console.error('Controller.consensoDetalle no está disponible');
            return false;
        }
    }
}
