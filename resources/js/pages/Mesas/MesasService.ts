import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import MesasCollection from '@/collections/MesasCollection';
import Mesa from '@/models/Mesa';

export interface MesasServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class MesasService {
    constructor(private readonly opts: MesasServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todas las mesas desde API
     */
    async findAllMesas(): Promise<any> {
        try {
            const response = await this.api.get('/mesas/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar mesas' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar mesas:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar mesas' });
            return null;
        }
    }

    /**
     * Guardar mesa
     */
    async __saveMesa(mesa: any): Promise<ApiResponse> {
        try {
            if (!mesa.isValid()) {
                const errors = mesa.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveMesaApi(mesa.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Mesa guardada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar mesa:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar mesa
     */
    async __removeMesa(mesa: any): Promise<ApiResponse> {
        try {
            const response = await this.removeMesaApi(mesa.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Mesa eliminada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar mesa:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Activar mesa
     */
    async __activarMesa(mesa: any): Promise<ApiResponse> {
        try {
            const response = await this.activarMesaApi(mesa.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Mesa activada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al activar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar mesa:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Inactivar mesa
     */
    async __inactivarMesa(mesa: any): Promise<ApiResponse> {
        try {
            const response = await this.inactivarMesaApi(mesa.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Mesa inactivada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al inactivar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar mesa:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Vincular trabajador a mesa
     */
    async __vincularMesa(data: any, trabajadorId: number): Promise<ApiResponse> {
        try {
            const payload = {
                ...data,
                trabajador_id: trabajadorId
            };

            const response = await this.vincularMesaApi(payload);

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Trabajador vinculado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al vincular trabajador' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al vincular trabajador:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    // Métodos privados (solo Service)

    /**
     * Guardar mesa en API
     */
    private async saveMesaApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/mesas/saveMesa', data);
    }

    /**
     * Eliminar mesa en API
     */
    private async removeMesaApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/mesas/removeMesa', data);
    }

    /**
     * Activar mesa en API
     */
    private async activarMesaApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/mesas/activarMesa', data);
    }

    /**
     * Inactivar mesa en API
     */
    private async inactivarMesaApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/mesas/inactivarMesa', data);
    }

    /**
     * Vincular trabajador a mesa en API
     */
    private async vincularMesaApi(payload: any): Promise<ApiResponse> {
        return await this.api.post('/mesas/vincularTrabajador', payload);
    }
}