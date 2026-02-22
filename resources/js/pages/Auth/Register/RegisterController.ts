import RegisterView from './RegisterView';
import type { RegisterViewOptions } from './types';
import { Controller } from '@/common/Controller';

export default class RegisterController extends Controller {
    registerView: RegisterView | Backbone.View | null = null;

    constructor(options: RegisterViewOptions) {
        super(options);

        // Escuchar eventos de navegación
        this.listenTo(this.app, 'navigate:login', this.navigateToLogin);
    }

    // Iniciar vista de registro
    register(): void {
        if (this.region) {
            this.registerView = new RegisterView({
                region: this.region,
                App: this
            });

            this.listenTo(this.registerView, 'navigate:login', this.navigateToLogin);
            this.region.show(this.registerView as any);
        }
    }

    // Navegar a página de login
    navigateToLogin(): void {
        window.location.href = '/login';
    }

    // Destruir controlador
    destroy(): void {
        if (this.registerView) {
            (this.registerView as any).remove();
            this.registerView = null;
        }
    }

    navigateToRegister(): void {
        window.location.href = '/register';
    }
}
