import { ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import AsambleasCollection from '@/collections/AsambleasCollection';
import ConsensosCollection from '@/collections/ConsensosCollection';
import type { Asamblea } from './types';

export interface AsambleaServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class AsambleaService {
    constructor(private readonly opts: AsambleaServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todas las asambleas desde API
     */
    async findAllAsambleas(): Promise<any> {
        try {
            const response = await this.api.get('/asamblea/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar asambleas' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar asambleas:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar asambleas' });
            return null;
        }
    }

    /**
     * Guardar asamblea
     */
    async __saveAsamblea(asamblea: any): Promise<ApiResponse> {
        try {
            if (!asamblea.isValid()) {
                const errors = asamblea.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveAsambleaApi(asamblea.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Asamblea guardada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar asamblea' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar asamblea:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar asamblea
     */
    async __removeAsamblea(asamblea: any): Promise<ApiResponse> {
        try {
            const response = await this.removeAsambleaApi(asamblea.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Asamblea eliminada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar asamblea' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar asamblea:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Activar asamblea
     */
    async __activarAsamblea(id: string): Promise<ApiResponse> {
        try {
            const response = await this.activarAsambleaApi(id);

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Asamblea activada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al activar asamblea' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar asamblea:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Exportar lista de asambleas
     */
    async __exportLista(): Promise<any> {
        try {
            const response = await this.exportListaApi();
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al exportar lista' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return null;
        }
    }

    /**
     * Crear consenso
     */
    async __crearConsenso(consenso: any): Promise<ApiResponse> {
        try {
            const response = await this.crearConsensoApi(consenso);
            return response;
        } catch (error: any) {
            this.logger.error('Error al crear consenso:', error);
            throw error;
        }
    }

    // Métodos privados (solo Service)

    /**
     * Guardar asamblea en API
     */
    private async saveAsambleaApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/asamblea/saveAsamblea', data);
    }

    /**
     * Eliminar asamblea en API
     */
    private async removeAsambleaApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/asamblea/removeAsamblea', data);
    }

    /**
     * Activar asamblea en API
     */
    private async activarAsambleaApi(id: string): Promise<ApiResponse> {
        return await this.api.post(`/asamblea/activarAsamblea`, { id });
    }

    /**
     * Exportar lista en API
     */
    private async exportListaApi(): Promise<ApiResponse> {
        return await this.api.get('/asamblea/exportLista');
    }

    /**
     * Crear consenso en API
     */
    private async crearConsensoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/asamblea/crearConsenso', data);
    }
}