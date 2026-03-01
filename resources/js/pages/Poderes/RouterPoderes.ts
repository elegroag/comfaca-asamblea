import { BackboneRouter } from "@/common/Bone";
import PoderesController from "./PoderesController";
import type { AppInstance } from "@/types/types";

interface RouterPoderesOptions {
    app: AppInstance;
}

export default class RouterPoderes extends BackboneRouter {
    controller: PoderesController | null = null;
    private app: AppInstance;

    constructor(options: RouterPoderesOptions) {
        super({
            routes: {
                '': 'listar',
                'listar': 'listar',
                'buscar': 'buscar',
                'crear': 'crear',
                'mostrar/:documento': 'mostrar',
                'buscar_apoderado/:nit': 'buscarApoderado',
                'buscar_poderdante/:nit': 'buscarPoderdante',
                'rechazar': 'rechazar',
                'masivo': 'masivo',
                'error': 'error'
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(PoderesController);
    }

    error() {
        this.init();
        console.log('RouterPoderes.error() called');
        if (this.controller && typeof this.controller.error === 'function') {
            this.controller.error();
        }
    }

    listar() {
        this.init();
        console.log('RouterPoderes.listar() called');
        if (this.controller && typeof this.controller.listar === 'function') {
            this.controller.listar();
        }
    }

    buscar() {
        this.init();
        console.log('RouterPoderes.buscar() called');
        if (this.controller && typeof this.controller.buscar === 'function') {
            this.controller.buscar();
        }
    }

    crear() {
        this.init();
        console.log('RouterPoderes.crear() called');
        if (this.controller && typeof this.controller.crearPoder === 'function') {
            this.controller.crearPoder();
        }
    }

    mostrar(documento: string) {
        this.init();
        console.log('RouterPoderes.mostrar() called', documento);
        if (this.controller && typeof this.controller.mostrarDetalle === 'function') {
            this.controller.mostrarDetalle(documento);
        }
    }

    buscarApoderado(nit: string) {
        this.init();
        console.log('RouterPoderes.buscarApoderado() called', nit);
        // Método no existe en controller, delegar a buscar general
        if (this.controller && typeof this.controller.buscar === 'function') {
            this.controller.buscar();
        }
    }

    buscarPoderdante(nit: string) {
        this.init();
        console.log('RouterPoderes.buscarPoderdante() called', nit);
        // Método no existe en controller, delegar a buscar general
        if (this.controller && typeof this.controller.buscar === 'function') {
            this.controller.buscar();
        }
    }

    rechazar() {
        this.init();
        console.log('RouterPoderes.rechazar() called');
        if (this.controller && typeof this.controller.crearRechazo === 'function') {
            this.controller.crearRechazo();
        }
    }

    masivo() {
        this.init();
        console.log('RouterPoderes.masivo() called');
        if (this.controller && typeof this.controller.cargueMasivo === 'function') {
            this.controller.cargueMasivo();
        }
    }
}
