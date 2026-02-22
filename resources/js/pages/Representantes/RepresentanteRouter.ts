import { BackboneRouter } from "@/common/Bone";
import RepresentanteController from "./RepresentanteController";
import { CommonDeps } from "@/types/CommonDeps";

interface RepresentanteRouterOptions extends Partial<CommonDeps> {
    region?: any;
}

export default class RepresentanteRouter extends BackboneRouter {
    private controller: RepresentanteController | null = null;
    private deps: CommonDeps;

    constructor(options: RepresentanteRouterOptions = {}) {
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

        // Guardar dependencias inyectadas
        this.deps = options as CommonDeps;
        this.controller = new RepresentanteController(this.deps);
        this._bindRoutes();
    }

    listaRepresentantes(): void {
        if (this.controller && typeof this.controller.listaRepresentantes === 'function') {
            this.controller.listaRepresentantes();
        }
    }

    crearRepresentante(): void {
        if (this.controller && typeof this.controller.crearRepresentante === 'function') {
            this.controller.crearRepresentante();
        }
    }

    editaRepresentante(cedula: string): void {
        if (this.controller && typeof this.controller.editaRepresentante === 'function') {
            this.controller.editaRepresentante(cedula);
        }
    }

    mostrarRepresentante(cedula: string): void {
        if (this.controller && typeof this.controller.mostrarRepresentante === 'function') {
            this.controller.mostrarRepresentante(cedula);
        }
    }

    defaultRoute(): void {
        // Redirigir a listar si no hay ruta específica
        this.navigate('listar', { trigger: true });
    }
}
