import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import ConsensosCollection from '@/collections/ConsensosCollection';
import Consenso from '@/models/Consenso';

export interface ConsensoServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class ConsensoService {
    constructor(private readonly opts: ConsensoServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todos los consensos desde API
     */
    async findAllConsensos(): Promise<any> {
        try {
            const response = await this.api.get('/consensos/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar consensos' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar consensos:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar consensos' });
            return null;
        }
    }

    /**
     * Guardar consenso
     */
    async __saveConsenso(consenso: any): Promise<ApiResponse> {
        try {
            if (!consenso.isValid()) {
                const errors = consenso.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveConsensoApi(consenso.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Consenso guardado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar consenso:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar consenso
     */
    async __removeConsenso(consenso: any): Promise<ApiResponse> {
        try {
            const response = await this.removeConsensoApi(consenso.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Consenso eliminado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar consenso:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Activar consenso
     */
    async __activarConsenso(consenso: any): Promise<ApiResponse> {
        try {
            const response = await this.activarConsensoApi(consenso.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Consenso activado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al activar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar consenso:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Inactivar consenso
     */
    async __inactivarConsenso(consenso: any): Promise<ApiResponse> {
        try {
            const response = await this.inactivarConsensoApi(consenso.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Consenso inactivado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al inactivar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar consenso:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    // Métodos privados (solo Service)

    /**
     * Guardar consenso en API
     */
    private async saveConsensoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/consensos/saveConsenso', data);
    }

    /**
     * Eliminar consenso en API
     */
    private async removeConsensoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/consensos/removeConsenso', data);
    }

    /**
     * Activar consenso en API
     */
    private async activarConsensoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/consensos/activarConsenso', data);
    }

    /**
     * Inactivar consenso en API
     */
    private async inactivarConsensoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/consensos/inactivarConsenso', data);
    }
}