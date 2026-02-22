import { BackboneRouter } from "@/common/Bone";
import ConsensoController from "./ConsensoController";
import type { AppInstance } from "@/types/types";

interface RouterConsensoOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterConsenso extends BackboneRouter {
    private controller: ConsensoController | null = null;
    private app: AppInstance;

    constructor(options: RouterConsensoOptions) {
        super({
            routes: {
                '': 'listarConsensos',
                'listar': 'listarConsensos',
                'crear': 'formCrearConsenso',
                'editar/:id': 'formEditConsenso',
                'consenso_detalle/:id': 'consensoDetalle',
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(ConsensoController);
    }

    listarConsensos(): void {
        this.init();
        if (this.controller && typeof this.controller.listarConsensos === 'function') {
            this.controller.listarConsensos();
        }
    }

    formCrearConsenso(): void {
        this.init();
        if (this.controller && typeof this.controller.formCrearConsenso === 'function') {
            this.controller.formCrearConsenso();
        }
    }

    formEditConsenso(id: string): void {
        this.init();
        if (this.controller && typeof this.controller.formEditConsenso === 'function') {
            this.controller.formEditConsenso(id);
        }
    }

    consensoDetalle(id: string): void {
        this.init();
        if (this.controller && typeof this.controller.consensoDetalle === 'function') {
            this.controller.consensoDetalle(id);
        }
    }
}
