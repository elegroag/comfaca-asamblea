import { BackboneRouter } from "@/common/Bone";
import CarteraController from "./CarteraController";
import type { AppInstance } from "@/types/types";

interface RouterCarteraOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class CarteraRouter extends BackboneRouter {
    controller: CarteraController | null = null;
    private app: AppInstance;

    constructor(options: RouterCarteraOptions) {
        super({
            routes: {
                '': 'listar',
                'listar': 'listar',
                'crear': 'crear',
                'cargue': 'cargueMasivo',
                'mostrar/:id': 'mostrar',
                'editar/:id': 'editar',
                'error': 'error'
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this.controller = null;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(CarteraController);
    }

    error() {
        this.init();
        console.log('CarteraRouter.error() called');
        this.controller?.error();
    }

    listar() {
        this.init();
        console.log('CarteraRouter.listar() called');
        this.controller?.listaCartera();
    }

    crear() {
        this.init();
        console.log('CarteraRouter.crear() called');
        this.controller?.crearCartera();
    }

    editar(id: string) {
        this.init();
        console.log('CarteraRouter.editar() called', id);
        if (!id || id === undefined || id === void 0) {
            this.app.trigger('warning', 'El id de la cartera es requerido.');
            this.navigate('listar', { trigger: true });
            return false;
        }
        this.controller?.editaCartera(id);
    }

    mostrar(id: string) {
        this.init();
        console.log('CarteraRouter.mostrar() called', id);
        if (!id || id === undefined || id === void 0) {
            this.app.trigger('warning', 'El id de la cartera es requerido.');
            this.navigate('listar', { trigger: true });
            return false;
        }
        this.controller?.mostrarDetalle(id);
    }

    cargueMasivo() {
        this.init();
        console.log('CarteraRouter.cargueMasivo() called');
        this.controller?.cargueMasivoCartera();
    }
}
