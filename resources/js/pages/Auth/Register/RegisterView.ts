import tmp_register from '@/componentes/auth/templates/register.hbs?raw';
import type { RegisterViewOptions, RegisterCredentials } from './types';
import { AppInstance } from '@/types/types';
import { ModelView } from '@/common/ModelView';
import { route } from 'ziggy-js';

// Vista de Register usando Backbone y Underscore
class RegisterView extends ModelView {
    App: AppInstance;

    constructor(options: RegisterViewOptions) {
        super(options as any);
        this.App = options.App;

        // Template usando sintaxis de Underscore
        this.template = _.template(tmp_register);

        // Eventos de la vista
        this.events = {
            'submit #register-form': 'handleRegister',
            'click #toggle-password': 'togglePasswordVisibility',
            'click #login-link': 'handleLoginLink'
        };

        // Delegar eventos
        this.delegateEvents();
    }

    // Validar formulario
    validateForm(): { isValid: boolean; errors: Record<string, string> } {
        const errors: Record<string, string> = {};

        // Validar nombre
        const name = (this as any).getInput('name');
        if (!name) {
            errors.name = 'El nombre es obligatorio';
        } else if (name.length < 3) {
            errors.name = 'El nombre debe tener al menos 3 caracteres';
        }

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
        } else if (password.length < 8) {
            errors.password = 'La contraseña debe tener al menos 8 caracteres';
        }

        // Validar confirmación de password
        const passwordConfirmation = (this as any).getInput('password_confirmation');
        if (!passwordConfirmation) {
            errors.password_confirmation = 'La confirmación de contraseña es obligatoria';
        } else if (password !== passwordConfirmation) {
            errors.password_confirmation = 'Las contraseñas no coinciden';
        }

        // Validar términos
        const terms = (this as any).getCheck('terms');
        if (terms === 0) {
            errors.terms = 'Debes aceptar los términos y condiciones';
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
        ['name', 'email', 'password', 'password_confirmation', 'terms'].forEach(fieldName => {
            const fieldEl = (this as any).$el.find(`#${fieldName}`);
            const errorDiv = (this as any).$el.find(`#${fieldName}-error`);

            fieldEl.removeClass('border-red-500');
            errorDiv.addClass('hidden');
        });
    }

    // Manejar registro
    async handleRegister(e: Event): Promise<void> {
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
        this.setRegisterButtonLoading(true);

        try {
            // Obtener credenciales
            const credentials: RegisterCredentials = {
                name: (this as any).getInput('name'),
                email: (this as any).getInput('email'),
                password: (this as any).getInput('password'),
                password_confirmation: (this as any).getInput('password_confirmation')
            };

            if (!this.App) {
                throw new Error('App no está inicializada');
            }
            // Enviar solicitud AJAX
            this.App.trigger('ajax', [{
                url: route('register.store'),
                method: 'POST',
                data: credentials,
                success: (response: any) => {
                    if (response.success) {
                        this.App?.trigger('notify', ['success', response.message || 'Cuenta creada exitosamente']);
                        // Redirigir al dashboard
                        window.location.href = response.redirect || route('dashboard');
                    } else {
                        this.App?.trigger('notify', ['error', response.message || 'Error al crear cuenta']);
                        this.resetRegisterButton();
                    }
                },
                error: (xhr: any) => {
                    let errorMessage = 'Error al crear cuenta';

                    if (xhr.responseJSON) {
                        if (xhr.responseJSON.message) {
                            errorMessage = xhr.responseJSON.message;
                        }
                        if (xhr.responseJSON.errors) {
                            // Mostrar errores de validación del servidor
                            this.showValidationErrors(xhr.responseJSON.errors);
                            return;
                        }
                    }

                    this.App?.trigger('notify', ['error', errorMessage]);
                    this.resetRegisterButton();
                }
            }]);

        } catch (error) {
            console.error('Error al crear cuenta:', error);
            this.App?.trigger('notify', ['error', 'Error al crear cuenta']);
            this.resetRegisterButton();
        }
    }

    // Estado de carga del botón
    setRegisterButtonLoading(loading: boolean): void {
        const registerBtn = (this as any).$el.find('#register-btn');

        if (loading) {
            registerBtn.prop('disabled', true)
                .html('<i class="fas fa-spinner fa-spin mr-2"></i>Creando cuenta...');
        } else {
            this.resetRegisterButton();
        }
    }

    // Resetear botón de registro
    resetRegisterButton(): void {
        const registerBtn = (this as any).$el.find('#register-btn');
        registerBtn.prop('disabled', false)
            .html('<span class="absolute left-0 inset-y-0 flex items-center pl-3"><svg class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></span>Crear Cuenta');
    }

    // Toggle visibilidad de contraseñas
    togglePasswordVisibility(e: Event): void {
        e.preventDefault();
        const passwordField = (this as any).$el.find('#password');
        const confirmField = (this as any).$el.find('#password_confirmation');
        const toggleBtn = (this as any).$el.find('#toggle-password i');

        const isPassword = passwordField.attr('type') === 'password';

        if (isPassword) {
            passwordField.attr('type', 'text');
            confirmField.attr('type', 'text');
            toggleBtn.removeClass('fa-eye').addClass('fa-eye-slash');
            toggleBtn.parent().html('<i class="fas fa-eye-slash"></i> Ocultar contraseñas');
        } else {
            passwordField.attr('type', 'password');
            confirmField.attr('type', 'password');
            toggleBtn.removeClass('fa-eye-slash').addClass('fa-eye');
            toggleBtn.parent().html('<i class="fas fa-eye"></i> Mostrar contraseñas');
        }
    }

    // Manejar enlace de login
    handleLoginLink(e: Event): void {
        e.preventDefault();

        // Navegar a página de login
        this.trigger('navigate:login');
    }
}

// Exportar componente de Register
export default RegisterView;
