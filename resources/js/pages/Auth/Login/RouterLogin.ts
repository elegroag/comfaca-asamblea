import LoginController from "./LoginController";
import { BackboneRouter } from "@/common/Bone";
import $App from "@/core/App";

class RouterLogin extends BackboneRouter {
    controller: LoginController;
    constructor(options = {}) {
        super({
            routes: {
                '': 'login',
                'login': 'login'
            },
            ...options,
        });

        this.controller = $App.startSubApplication(LoginController, this);
        this._bindRoutes();
    }

    login() {
        console.log('RouterLogin.login() called');
        this.controller.login();
    }

}

export default RouterLogin;
