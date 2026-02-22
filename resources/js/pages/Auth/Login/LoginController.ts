import LoginView from './LoginView';
import type { LoginViewOptions } from './types';
import { Controller } from '@/common/Controller';

export default class LoginController extends Controller {

    loginView: LoginView | Backbone.View | null = null;

    constructor(options: LoginViewOptions) {
        super({
            ...options,
            region: options.region,
            logger: options.logger,
            router: options.router,
        });
    }

    // Iniciar vista de login
    login(): void {
        console.log('LoginController.login() called');
        if (this.region && this.app) {
            this.loginView = new LoginView({
                region: this.region,
                app: this.app,
                router: this.router,
                api: this.api
            });

            this.listenTo(this.loginView, 'navigate:register', this.navigateToRegister);
            this.listenTo(this.loginView, 'navigate:forgot-password', this.navigateToForgotPassword);
            this.region.show(this.loginView as any);
            console.log('LoginView shown in region');
        } else {
            console.log('No region available');
        }
    }

    // Navegar a página de registro
    navigateToRegister(): void {
        window.location.href = '/register';
    }

    // Navegar a página de recuperación de contraseña
    navigateToForgotPassword(): void {
        this.trigger('notify', ['info', 'Funcionalidad de recuperación de contraseña próximamente']);
    }

    // Destruir controlador
    destroy(): void {
        if (this.loginView) {
            (this.loginView as any).remove();
            this.loginView = null;
        }
    }
}
