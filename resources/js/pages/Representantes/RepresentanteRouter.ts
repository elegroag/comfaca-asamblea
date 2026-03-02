import { BackboneRouter } from "@/common/Bone";
import RepresentanteController from "./RepresentanteController";
import type { AppInstance } from "@/types/types";

interface RepresentanteRouterOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RepresentanteRouter extends BackboneRouter {
    private controller: RepresentanteController | null = null;
    private app: AppInstance;

    constructor(options: RepresentanteRouterOptions) {
        super({
            ...options,
            routes: {
                listar: 'listaRepresentantes',
                crear: 'crearRepresentante',
                'editar/:cedula': 'editaRepresentante',
                'mostrar/:cedula': 'mostrarRepresentante',
                '*path': 'defaultRoute',
            },
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(RepresentanteController);
    }

    listaRepresentantes(): void {
        this.init();
        this.controller.listaRepresentantes();
    }

    crearRepresentante(): void {
        this.init();
        if (this.controller && typeof this.controller.crearRepresentante === 'function') {
            this.controller.crearRepresentante();
        }
    }

    editaRepresentante(cedula: string): void {
        this.init();
        if (this.controller && typeof this.controller.editaRepresentante === 'function') {
            this.controller.editaRepresentante(cedula);
        }
    }

    mostrarRepresentante(cedula: string): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarRepresentante === 'function') {
            this.controller.mostrarRepresentante(cedula);
        }
    }

    defaultRoute(): void {
        // Redirigir a listar si no hay ruta específica
        this.navigate('listar', { trigger: true });
    }
}
