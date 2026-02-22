import { BackboneRouter } from "@/common/Bone";
import MesasController from "./MesasController";
import type { AppInstance } from "@/types/types";

interface RouterMesasOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class MesasRouter extends BackboneRouter {
    private controller: MesasController | null = null;
    private app: AppInstance;

    constructor(options: RouterMesasOptions) {
        super({
            routes: {
                listar: 'listarMesas',
                crear: 'crearMesa',
                listar_comfaca: 'listarMesas',
                'editar/:id': 'editaMesa',
                'mostrar/:mesa': 'mostrarMesas',
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
        this.controller = this.app.startSubApplication(MesasController);
    }

    listarMesas(): void {
        this.init();
        if (this.controller && typeof this.controller.listarMesas === 'function') {
            this.controller.listarMesas();
        }
    }

    crearMesa(): void {
        this.init();
        if (this.controller && typeof this.controller.crearMesa === 'function') {
            this.controller.crearMesa();
        }
    }

    editaMesa(id: string): void {
        this.init();
        if (this.controller && typeof this.controller.editarMesa === 'function') {
            this.controller.editarMesa(id);
        }
    }

    mostrarMesas(mesa: string): void {
        this.init();
        if (this.controller && typeof this.controller.mostrarMesa === 'function') {
            this.controller.mostrarMesa(mesa);
        }
    }
}
