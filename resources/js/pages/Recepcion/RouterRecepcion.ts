import { BackboneRouter } from "@/common/Bone";
import RecepcionController from "./RecepcionController";
import type { AppInstance } from "@/types/types";

interface RouterRecepcionOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterRecepcion extends BackboneRouter {

    private app: AppInstance;

    constructor(options: RouterRecepcionOptions) {
        super({
            routes: {
                '': 'listaRecepcion',
                'registro-ingresos': 'listaRecepcion',
                'mostrar/:cedrep': 'mostrarAsistente',
                'validacion/:cedrep': 'mostrarValidacion',
                'control-acceso': 'buscarAsistencia',
                'rechazados': 'listarRechazos',
                'ficha/:cedrep': 'mostrarFicha',
                errors: 'mostrarError',
                'registro-empresa/:nit': 'registroEmpresa',
                'crear-registro': 'crearRegistro',
                'listar-inscritos': 'listarInscritos',
                'registros-pendientes': 'registrosPendientes',
            },
            ...options,
        });

        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        return this.app.startSubApplication(RecepcionController) as RecepcionController;
    }

    listaRecepcion(): void {
        const controller = this.init();
        controller.listaRecepcion();
    }

    mostrarAsistente(cedrep: string): void {
        const controller = this.init();
        controller.mostrarAsistente(cedrep);
    }

    mostrarValidacion(cedrep: string): void {
        const controller = this.init();
        controller.mostrarValidacion(cedrep);
    }

    buscarAsistencia(): void {
        const controller = this.init();
        controller.buscarAsistencia();
    }

    listarRechazos(): void {
        const controller = this.init();
        controller.listarRechazos();
    }

    mostrarFicha(cedrep: string): void {
        const controller = this.init();
        controller.mostrarFicha(cedrep);
    }

    mostrarError(): void {
        const controller = this.init();
        controller.mostrarError();
    }

    registroEmpresa(nit: string): void {
        const controller = this.init();
        controller.registroEmpresa(nit);
    }

    crearRegistro(): void {
        const controller = this.init();
        controller.crearRegistro();
    }

    listarInscritos(): void {
        const controller = this.init();
        controller.listarInscritos();
    }

    registrosPendientes(): void {
        const controller = this.init();
        controller.registrosPendientes();
    }
}
