import tmp_login from '@/componentes/auth/templates/login.hbs?raw';
import type { LoginViewOptions, LoginCredentials } from './types';
import { ModelView } from '@/common/ModelView';
import Logger from '@/common/Logger';
import type { responseBody, AppInstance } from '@/types/types';
import { route } from 'ziggy-js';

// Vista de Login usando Backbone y Underscore
class LoginView extends ModelView {
    app: AppInstance;

    constructor(options: LoginViewOptions) {
        super(options as any);
        this.App = options.App;

        // Template usando sintaxis de Underscore
        this.template = _.template(tmp_login);

        // Eventos de la vista
        this.events = {
            'submit #login-form': 'handleLogin',
            'click #toggle-password': 'togglePasswordVisibility',
            'click #forgot-password-link': 'handleForgotPassword',
            'click #register-link': 'handleRegisterLink'
        };

        // Delegar eventos
        this.delegateEvents();
        this.logger = new Logger();
    }

    // Validar formulario
    validateForm(): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        // Validar email
        const email = (this as any).getInput('email');
        if (!email) {
            errors.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'El email no es válido';
        }

        // Validar password
        const password = (this as any).getInput('password');
        if (!password) {
            errors.password = 'La contraseña es obligatoria';
        } else if (password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Mostrar errores de validación
    showValidationErrors(errors: Record<string, string>): void {
        // Limpiar errores anteriores
        this.clearValidationErrors();

        // Mostrar nuevos errores
        Object.entries(errors).forEach(([fieldName, message]) => {
            const fieldEl = (this as any).$el.find(`#${fieldName}`);
            const errorDiv = (this as any).$el.find(`#${fieldName}-error`);

            fieldEl.addClass('border-red-500');
            errorDiv.text(message).removeClass('hidden');
        });
    }

    // Limpiar errores de validación
    clearValidationErrors(): void {
        ['email', 'password'].forEach(fieldName => {
            const fieldEl = (this as any).$el.find(`#${fieldName}`);
            const errorDiv = (this as any).$el.find(`#${fieldName}-error`);

            fieldEl.removeClass('border-red-500');
            errorDiv.addClass('hidden');
        });
    }

    // Manejar login
    handleLogin(e: Event): void {
        e.preventDefault();

        // Validar formulario
        const validation = this.validateForm();
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }

        // Limpiar errores
        this.clearValidationErrors();

        // Deshabilitar botón
        this.setLoginButtonLoading(true);

        try {
            // Obtener credenciales
            const credentials: LoginCredentials = {
                email: (this as any).getInput('email'),
                password: (this as any).getInput('password'),
                remember: (this as any).getCheck('remember') > 0
            };

            const url = route('login.authenticate');

            this.app.trigger('ajax', {
                url,
                method: 'POST',
                data: credentials,
                callback: (response: responseBody) => {
                    console.log('LoginView.handleLogin.success', response);
                    if (response && response.success) {
                        this.app.trigger('notify', 'success', response.message || 'Login exitoso');

                        window.location.href = route('dashboard') || '/dashboard';
                    } else {
                        this.app.trigger('notify', 'error', response.message || 'Error al iniciar sesión');
                        this.resetLoginButton();
                    }
                }
            });

        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            this.app.trigger('notify', 'error', 'Error al iniciar sesión');
            this.resetLoginButton();
        }
    }

    // Estado de carga del botón
    setLoginButtonLoading(loading: boolean): void {
        const loginBtn = (this as any).$el.find('#login-btn');

        if (loading) {
            loginBtn.prop('disabled', true)
                .html('<i class="fas fa-spinner fa-spin mr-2"></i>Iniciando sesión...');
        } else {
            this.resetLoginButton();
        }
    }

    // Resetear botón de login
    resetLoginButton(): void {
        const loginBtn = (this as any).$el.find('#login-btn');
        loginBtn.prop('disabled', false)
            .html('<span class="absolute left-0 inset-y-0 flex items-center pl-3"><svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" /></svg></span>Iniciar Sesión');
    }

    // Toggle visibilidad de contraseña
    togglePasswordVisibility(e: Event): void {
        e.preventDefault();
        const passwordField = (this as any).$el.find('#password');
        const toggleBtn = (this as any).$el.find('#toggle-password i');

        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            toggleBtn.removeClass('fa-eye').addClass('fa-eye-slash');
            toggleBtn.parent().html('<i class="fas fa-eye-slash"></i> Ocultar contraseña');
        } else {
            passwordField.attr('type', 'password');
            toggleBtn.removeClass('fa-eye-slash').addClass('fa-eye');
            toggleBtn.parent().html('<i class="fas fa-eye"></i> Mostrar contraseña');
        }
    }

    // Manejar enlace de contraseña olvidada
    handleForgotPassword(e: Event): void {
        e.preventDefault();

        // Navegar a página de recuperación
        this.app.trigger('navigate:forgot-password');
    }

    // Manejar enlace de registro
    handleRegisterLink(e: Event): void {
        e.preventDefault();

        // Navegar a página de registro
        this.trigger('navigate:register');
    }
}

// Exportar componente de Login
export default LoginView;
