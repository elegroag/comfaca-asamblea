import { BackboneRouter } from "@/common/Bone";
import TrabajadoresController from "./TrabajadoresController";
import type { AppInstance } from "@/types/types";

interface RouterTrabajadorOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterTrabajador extends BackboneRouter {
    private controller: TrabajadoresController | null = null;
    private app: AppInstance;

    constructor(options: RouterTrabajadorOptions) {
        super({
            ...options,
            routes: {
                listar: 'listaTrabajadores',
                crear: 'crearTrabajador',
                'mostrar/:cedula': 'mostrarTrabajador',
                cargue: 'cargueTrabajador',
            },
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(TrabajadoresController);
    }

    listaTrabajadores(): void {
        this.init();
        if (this.controller && typeof this.controller.listarTrabajadores === 'function') {
            this.controller.listarTrabajadores();
        }
    }

    mostrarTrabajador(cedula: string): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarTrabajador === 'function') {
            this.controller.mostrarTrabajador(cedula);
        }
    }

    crearTrabajador(): void {
        this.init();
        if (this.controller && typeof this.controller.crearTrabajador === 'function') {
            this.controller.crearTrabajador();
        }
    }

    cargueTrabajador(): void {
        this.init();
        // Método no existe en controller, delegar a crear
        if (this.controller && typeof this.controller.crearTrabajador === 'function') {
            this.controller.crearTrabajador();
        }
    }
}
