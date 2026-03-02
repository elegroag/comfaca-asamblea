import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import InterventoresCollection from '@/collections/InterventoresCollection';
import Interventor from '@/models/Interventor';

export interface InterventorServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class InterventorService {
    constructor(private readonly opts: InterventorServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todos los interventores desde API
     */
    async findAllInterventores(): Promise<any> {
        try {
            const response = await this.api.get('/interventores/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar interventores' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar interventores:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar interventores' });
            return null;
        }
    }

    /**
     * Guardar interventor
     */
    async __saveInterventor(interventor: any): Promise<ApiResponse> {
        try {
            if (!interventor.isValid()) {
                const errors = interventor.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveInterventorApi(interventor.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Interventor guardado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar interventor' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar interventor:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar interventor
     */
    async __removeInterventor(interventor: any): Promise<ApiResponse> {
        try {
            const response = await this.removeInterventorApi(interventor.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Interventor eliminado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar interventor' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar interventor:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Activar interventor
     */
    async __activarInterventor(interventor: any): Promise<ApiResponse> {
        try {
            const response = await this.activarInterventorApi(interventor.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Interventor activado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al activar interventor' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar interventor:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Inactivar interventor
     */
    async __inactivarInterventor(interventor: any): Promise<ApiResponse> {
        try {
            const response = await this.inactivarInterventorApi(interventor.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Interventor inactivado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al inactivar interventor' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar interventor:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    // Métodos privados (solo Service)

    /**
     * Guardar interventor en API
     */
    private async saveInterventorApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/interventores/saveInterventor', data);
    }

    /**
     * Eliminar interventor en API
     */
    private async removeInterventorApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/interventores/removeInterventor', data);
    }

    /**
     * Activar interventor en API
     */
    private async activarInterventorApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/interventores/activarInterventor', data);
    }

    /**
     * Inactivar interventor en API
     */
    private async inactivarInterventorApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/interventores/inactivarInterventor', data);
    }
}