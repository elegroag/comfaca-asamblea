import { BackboneRouter } from "@/common/Bone";
import RecepcionController from "./RecepcionController";
import { CommonDeps } from "@/types/CommonDeps";

interface RouterRecepcionOptions extends Partial<CommonDeps> {
    region?: any;
}

export default class RouterRecepcion extends BackboneRouter {
    private controller: RecepcionController | null = null;
    private deps: CommonDeps;

    constructor(options: RouterRecepcionOptions = {}) {
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

        // Guardar dependencias inyectadas
        this.deps = options as CommonDeps;
        this.controller = new RecepcionController(this.deps);
        this._bindRoutes();
    }

    listaRecepcion(): void {
        if (this.controller && typeof this.controller.listaRecepcion === 'function') {
            this.controller.listaRecepcion();
        }
    }

    mostrarAsistente(cedrep: string): void {
        if (this.controller && typeof this.controller.mostrarAsistente === 'function') {
            this.controller.mostrarAsistente(cedrep);
        }
    }

    mostrarValidacion(cedrep: string): void {
        if (this.controller && typeof this.controller.mostrarValidacion === 'function') {
            this.controller.mostrarValidacion(cedrep);
        }
    }

    buscarAsistencia(): void {
        if (this.controller && typeof this.controller.buscarAsistencia === 'function') {
            this.controller.buscarAsistencia();
        }
    }

    listarRechazos(): void {
        if (this.controller && typeof this.controller.listarRechazos === 'function') {
            this.controller.listarRechazos();
        }
    }

    mostrarFicha(cedrep: string): void {
        if (this.controller && typeof this.controller.mostrarFicha === 'function') {
            this.controller.mostrarFicha(cedrep);
        }
    }

    mostrarError(): void {
        if (this.controller && typeof this.controller.mostrarError === 'function') {
            this.controller.mostrarError();
        }
    }

    registroEmpresa(nit: string): void {
        if (this.controller && typeof this.controller.registroEmpresa === 'function') {
            this.controller.registroEmpresa(nit);
        }
    }

    crearRegistro(): void {
        if (this.controller && typeof this.controller.crearRegistro === 'function') {
            this.controller.crearRegistro();
        }
    }

    listarInscritos(): void {
        if (this.controller && typeof this.controller.listarInscritos === 'function') {
            this.controller.listarInscritos();
        }
    }

    registrosPendientes(): void {
        if (this.controller && typeof this.controller.registrosPendientes === 'function') {
            this.controller.registrosPendientes();
        }
    }
}
