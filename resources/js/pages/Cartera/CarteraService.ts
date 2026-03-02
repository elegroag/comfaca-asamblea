import { ServiceOptions, ApiResponse, FileUploadTransfer } from '@/types/CommonDeps';
import Cartera from '@/models/Cartera';
import { cacheCollection, getCachedCollection, CacheManager } from '@/componentes/CacheManager';

export default class CarteraService {
    constructor(private readonly opts: ServiceOptions) {
        _.extend(this, opts);
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todas las carteras
     */
    async findAllCarteras(): Promise<ApiResponse> {
        try {
            const response = await this.findAllApi();
            return response;
        } catch (error: any) {
            this.logger.error('Error al listar carteras:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Buscar cartera por ID
     */
    async findCartera(id: string): Promise<ApiResponse> {
        try {
            const response = await this.findCarteraApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al buscar cartera:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Guardar cartera (crear o actualizar)
     */
    async saveCartera(cartera: Cartera): Promise<ApiResponse> {
        try {
            const response = cartera.id
                ? await this.updateCarteraApi(cartera)
                : await this.createCarteraApi(cartera);

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar cartera:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar cartera
     */
    async removeCartera(id: string): Promise<ApiResponse> {
        try {
            const response = await this.deleteCarteraApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar cartera:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Activar cartera
     */
    async activarCartera(id: string): Promise<ApiResponse> {
        try {
            const response = await this.activarCarteraApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al activar cartera:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Inactivar cartera
     */
    async inactivarCartera(id: string): Promise<ApiResponse> {
        try {
            const response = await this.inactivarCarteraApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar cartera:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Subir archivo masivo
     */
    async uploadMasivo(options: FileUploadTransfer): Promise<ApiResponse> {
        try {
            const response = await this.uploadMasivoApi(options.formData);
            return response;
        } catch (error: any) {
            this.logger.error('Error en cargue masivo:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Exportar lista de carteras
     */
    async exportLista(): Promise<ApiResponse> {
        try {
            const response = await this.exportListaApi();
            return response;
        } catch (error: any) {
            this.logger.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    // Métodos privados (solo API)

    /**
     * Obtener carteras desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/cartera/listar');
    }

    /**
     * Buscar cartera por ID desde API
     */
    private async findCarteraApi(id: string): Promise<ApiResponse> {
        return await this.api.get(`/cartera/${id}`);
    }

    /**
     * Crear cartera en API
     */
    private async createCarteraApi(cartera: Cartera): Promise<ApiResponse> {
        return await this.api.post('/cartera/crear', cartera);
    }

    /**
     * Actualizar cartera en API
     */
    private async updateCarteraApi(cartera: Cartera): Promise<ApiResponse> {
        return await this.api.put(`/cartera/editar/${cartera.id}`, cartera);
    }

    /**
     * Eliminar cartera en API
     */
    private async deleteCarteraApi(id: string): Promise<ApiResponse> {
        return await this.api.delete(`/cartera/eliminar/${id}`);
    }

    /**
     * Activar cartera en API
     */
    private async activarCarteraApi(id: string): Promise<ApiResponse> {
        return await this.api.post(`/cartera/activar/${id}`);
    }

    /**
     * Inactivar cartera en API
     */
    private async inactivarCarteraApi(id: string): Promise<ApiResponse> {
        return await this.api.post(`/cartera/inactivar/${id}`);
    }

    /**
     * Subir archivo masivo a API
     */
    private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
        return await this.api.post('/cartera/cargue_masivo', formData);
    }

    /**
     * Exportar lista desde API
     */
    private async exportListaApi(): Promise<ApiResponse> {
        return await this.api.get('/cartera/exportar_lista');
    }
}
