import LoginController from "./LoginController";
import { BackboneRouter } from "@/common/Bone";
import type { AppInstance } from "@/types/types";

interface RouterLoginOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

class RouterLogin extends BackboneRouter {
    private controller: LoginController | null = null;
    private app: AppInstance;

    constructor(options: RouterLoginOptions) {
        super({
            routes: {
                '': 'login',
                'login': 'login'
            },
            ...options,
        });

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(LoginController);
    }

    login() {
        this.init();
        if (this.controller && typeof this.controller.login === 'function') {
            this.controller.login();
        }
    }
}

export default RouterLogin;
