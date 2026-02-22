import { BackboneRouter } from "@/common/Bone";
import RechazosController from "./RechazosController";
import type { AppInstance } from "@/types/types";

interface RouterRechazosOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterRechazos extends BackboneRouter {
    private controller: RechazosController | null = null;
    private app: AppInstance;

    constructor(options: RouterRechazosOptions) {
        super({
            ...options,
            routes: {
                listar: 'listaRechazos',
                cargue: 'masivoRechazo',
                crear: 'crearRechazo',
                'detalle/:id': 'detailRechazo',
                'edita/:id': 'editaRechazo',
            },
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(RechazosController);
    }

    masivoRechazo(): void {
        this.init();
        if (this.controller && typeof this.controller.showMasivo === 'function') {
            this.controller.showMasivo();
        }
    }

    listaRechazos(): void {
        this.init();
        // Método no existe en controller, delegar a showCreate
        if (this.controller && typeof this.controller.showCreate === 'function') {
            this.controller.showCreate();
        }
    }

    crearRechazo(): void {
        this.init();
        if (this.controller && typeof this.controller.showCreate === 'function') {
            this.controller.showCreate();
        }
    }

    detailRechazo(id: string): void {
        this.init();
        // Método no existe en controller, delegar a showCreate
        if (this.controller && typeof this.controller.showCreate === 'function') {
            this.controller.showCreate();
        }
    }

    editaRechazo(id: string): void {
        this.init();
        // Método no existe en controller, delegar a showCreate
        if (this.controller && typeof this.controller.showCreate === 'function') {
            this.controller.showCreate();
        }
    }
}
