import RegisterController from "./RegisterController";
import { BackboneRouter } from "@/common/Bone";
import $App from "@/core/App";

class RouterRegister extends BackboneRouter {
    controller: RegisterController;

    constructor(options = {}) {
        super({
            routes: {
                '': 'register',
                'register': 'register',
            },
            ...options,
        });

        this.controller = $App.startSubApplication(RegisterController, this);
        _.extend(this.controller.router, this);
        this._bindRoutes();
    }

    register() {
        this.controller.register();
    }
}

export default RouterRegister;
