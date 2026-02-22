import RegisterController from "./RegisterController";
import { BackboneRouter } from "@/common/Bone";
import type { AppInstance } from "@/types/types";

interface RouterRegisterOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

class RouterRegister extends BackboneRouter {
    private controller: RegisterController | null = null;
    private app: AppInstance;

    constructor(options: RouterRegisterOptions) {
        super({
            routes: {
                '': 'register',
                'register': 'register',
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(RegisterController);
        // Mantener compatibilidad con el código existente
        if (this.controller && this.controller.router) {
            _.extend(this.controller.router, this);
        }
    }

    register() {
        this.init();
        if (this.controller && typeof this.controller.register === 'function') {
            this.controller.register();
        }
    }
}

export default RouterRegister;
