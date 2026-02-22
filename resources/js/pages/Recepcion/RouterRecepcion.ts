import { BackboneRouter } from "@/common/Bone";
import RecepcionController from "./RecepcionController";
import type { AppInstance } from "@/types/types";

interface RouterRecepcionOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterRecepcion extends BackboneRouter {
    private controller: RecepcionController | null = null;
    private app: AppInstance;

    constructor(options: RouterRecepcionOptions) {
        super({
            routes: {
                '': 'listaRecepcion',
                listar: 'listaRecepcion',
                'mostrar/:cedrep': 'mostrarAsistente',
                'validacion/:cedrep': 'mostrarValidacion',
                buscar: 'buscarAsistencia',
                'rechazados': 'listarRechazos',
                'ficha/:cedrep': 'mostrarFicha',
                errors: 'mostrarError',
                'registro_empresa/:nit': 'registroEmpresa',
                crear: 'crearRegistro',
                listar_inscritos: 'listarInscritos',
                registros_pendientes: 'registrosPendientes',
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(RecepcionController);
    }

    listaRecepcion(): void {
        this.init();
        if (this.controller && typeof this.controller.listaRecepcion === 'function') {
            this.controller.listaRecepcion();
        }
    }

    mostrarAsistente(cedrep: string): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarAsistente === 'function') {
            this.controller.mostrarAsistente(cedrep);
        }
    }

    mostrarValidacion(cedrep: string): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarValidacion === 'function') {
            this.controller.mostrarValidacion(cedrep);
        }
    }

    buscarAsistencia(): void {
        this.init();
        if (this.controller && typeof this.controller.buscarAsistencia === 'function') {
            this.controller.buscarAsistencia();
        }
    }

    listarRechazos(): void {
        this.init();
        if (this.controller && typeof this.controller.listarRechazos === 'function') {
            this.controller.listarRechazos();
        }
    }

    mostrarFicha(cedrep: string): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarFicha === 'function') {
            this.controller.mostrarFicha(cedrep);
        }
    }

    mostrarError(): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarError === 'function') {
            this.controller.mostrarError();
        }
    }

    registroEmpresa(nit: string): void {
        this.init();
        if (this.controller && typeof this.controller.registroEmpresa === 'function') {
            this.controller.registroEmpresa(nit);
        }
    }

    crearRegistro(): void {
        this.init();
        if (this.controller && typeof this.controller.crearRegistro === 'function') {
            this.controller.crearRegistro();
        }
    }

    listarInscritos(): void {
        this.init();
        if (this.controller && typeof this.controller.listarInscritos === 'function') {
            this.controller.listarInscritos();
        }
    }

    registrosPendientes(): void {
        this.init();
        if (this.controller && typeof this.controller.registrosPendientes === 'function') {
            this.controller.registrosPendientes();
        }
    }
}
