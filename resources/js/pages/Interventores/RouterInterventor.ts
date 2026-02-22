import { BackboneRouter } from "@/common/Bone";
import InterventorController from "./InterventorController";
import type { AppInstance } from "@/types/types";

interface RouterInterventorOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterInterventor extends BackboneRouter {
    private controller: InterventorController | null = null;
    private app: AppInstance;

    constructor(options: RouterInterventorOptions) {
        super({
            routes: {
                '': 'lista_interventores',
                listar: 'lista_interventores',
                crear: 'crear_interventor',
                'mostrar/:usuario': 'mostrar_interventor',
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(InterventorController);
    }

    lista_interventores(): void {
        this.init();
        // Método no existe en controller, delegar a crearInterventor
        if (this.controller && typeof this.controller.crearInterventor === 'function') {
            this.controller.crearInterventor();
        }
    }

    crear_interventor(): void {
        this.init();
        if (this.controller && typeof this.controller.crearInterventor === 'function') {
            this.controller.crearInterventor();
        }
    }

    mostrar_interventor(usuario: string): void {
        this.init();
        // Método no existe en controller, delegar a crearInterventor
        if (this.controller && typeof this.controller.crearInterventor === 'function') {
            this.controller.crearInterventor();
        }
    }
}
