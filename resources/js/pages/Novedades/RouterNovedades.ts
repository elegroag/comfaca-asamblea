import { BackboneRouter } from "@/common/Bone";
import NovedadesController from "./NovedadesController";
import type { AppInstance } from "@/types/types";

interface RouterNovedadesOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterNovedades extends BackboneRouter {
    private controller: NovedadesController | null = null;
    private app: AppInstance;

    constructor(options: RouterNovedadesOptions) {
        super({
            routes: {
                '': 'listarNovedades',
                listar: 'listarNovedades',
                'detalle/:id': 'detalleNovedad',
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(NovedadesController);
    }

    listarNovedades(): void {
        this.init();
        if (this.controller && typeof this.controller.listarNovedades === 'function') {
            this.controller.listarNovedades();
        }
    }

    detalleNovedad(id: string): void {
        this.init();
        if (this.controller && typeof this.controller.detalleNovedad === 'function') {
            this.controller.detalleNovedad(id);
        }
    }
}
