import { ServiceOptions, ApiResponse, FileUploadTransfer } from '@/types/CommonDeps';
import CriteriosRechazos from '@/collections/CriteriosRechazos';
import EmpresasCollection from '@/collections/EmpresasCollection';
import Poder from '@/models/Poder';
import { cacheCollection, getCachedCollection, CacheManager } from '@/componentes/CacheManager';


export default class PoderService {
    constructor(private readonly opts: ServiceOptions) {
        _.extend(this, opts);
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todos los poderes
     */
    async findAllPoderes(): Promise<ApiResponse> {
        try {
            const response = await this.findAllApi();
            return response;
        } catch (error: any) {
            this.logger.error('Error al listar poderes:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Buscar poder por ID
     */
    async findPoder(id: string): Promise<ApiResponse> {
        try {
            const response = await this.findPoderApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al buscar poder:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Guardar poder (crear o actualizar)
     */
    async savePoder(poder: Poder): Promise<ApiResponse> {
        try {
            const response = poder.id
                ? await this.updatePoderApi(poder)
                : await this.createPoderApi(poder);

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar poder:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar poder
     */
    async removePoder(id: string): Promise<ApiResponse> {
        try {
            const response = await this.deletePoderApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar poder:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Activar poder
     */
    async activarPoder(id: string): Promise<ApiResponse> {
        try {
            const response = await this.activarPoderApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al activar poder:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Inactivar poder
     */
    async inactivarPoder(id: string): Promise<ApiResponse> {
        try {
            const response = await this.inactivarPoderApi(id);
            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar poder:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Cargue masivo de poderes
     */
    async uploadMasivo({ formData, callback }: FileUploadTransfer): Promise<void> {
        try {
            const response = await this.uploadMasivoApi(formData);

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Cargue masivo exitoso' });
                callback(true, response);
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error en el cargue masivo' });
                callback(false);
            }
        } catch (error: any) {
            this.logger.error('Error en cargue masivo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            callback(false);
        }
    }

    /**
     * Exportar lista de poderes
     */
    async exportLista(): Promise<void> {
        try {
            const response = await this.exportListaApi();

            if (response?.success && response.url) {
                this.app.download({
                    url: response.url,
                    filename: response.filename || 'poderes.csv'
                });
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al exportar lista' });
            }
        } catch (error: any) {
            this.logger.error('Error al exportar lista:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Validación previa de poder
     */
    async validarPoder(data: Record<string, string>): Promise<ApiResponse> {
        try {
            const response = await this.validarPoderApi(data);
            return response;
        } catch (error: any) {
            this.logger.error('Error en validación previa:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Buscar empresa por NIT
     */
    async buscarEmpresa(nit: string): Promise<ApiResponse> {
        try {
            const response = await this.buscarEmpresaApi(nit);
            return response;
        } catch (error: any) {
            this.logger.error('Error al buscar empresa:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Registrar rechazo de poder
     */
    async registrarRechazo(data: Record<string, any>): Promise<ApiResponse> {
        try {
            const response = await this.registrarRechazoApi(data);
            return response;
        } catch (error: any) {
            this.logger.error('Error al registrar rechazo:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Buscar poder con datos relacionados
     */
    async findPoderCompleto(id: string): Promise<{
        apoderado: EmpresasCollection;
        poderdante: EmpresasCollection;
        poder: Poder;
        criteriosRechazos: CriteriosRechazos;
    } | null> {
        try {
            const response = await this.api.get(`/poderes/detalle/${id}`);
            if (response?.success) {
                const apoderado = new EmpresasCollection(response?.data?.habil_apoderado);
                const poderdante = new EmpresasCollection(response?.data?.habil_poderdante);
                const poder = new Poder(response?.data?.poder);
                const criteriosRechazos = new CriteriosRechazos(response?.data?.criterio_rechazos);
                return {
                    apoderado,
                    poderdante,
                    poder,
                    criteriosRechazos
                };
            } else {
                this.logger.error('Error al cargar poder:', response?.message);
                this.app?.trigger('alert:error', { message: response?.message || 'Error al cargar poder' });
                return null;
            }
        } catch (error: any) {
            this.logger.error('Error en findPoderCompleto:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return null;
        }
    }

    /**
     * Buscar criterios de rechazo (con cache para datos de referencia)
     */
    async findCriteriosRechazos(): Promise<CriteriosRechazos | null> {
        try {
            // Primero intentar obtener desde cache
            let criteriosRechazos = getCachedCollection('criterios_rechazos', CriteriosRechazos);

            if (!criteriosRechazos) {
                // Si no hay datos en cache, cargar desde API
                const response = await this.api.get('/poderes/criterios-rechazo');
                if (response?.success) {
                    criteriosRechazos = new CriteriosRechazos(response?.data);
                    // Guardar en cache para uso futuro (persistente por 1 hora)
                    cacheCollection('criterios_rechazos', criteriosRechazos, {
                        persistent: true,
                        ttl: 60 * 60 * 1000 // 1 hora
                    });
                    return criteriosRechazos;
                } else {
                    this.logger.error('Error al cargar criterios de rechazo:', response?.message);
                    this.app?.trigger('alert:error', { message: response?.message || 'Error al cargar criterios de rechazo' });
                    return null;
                }
            }

            return criteriosRechazos;
        } catch (error: any) {
            this.logger.error('Error en findCriteriosRechazos:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return null;
        }
    }

    /**
     * Limpiar cache de criterios de rechazo
     */
    clearCriteriosCache(): void {
        CacheManager.removeCollection('criterios_rechazos');
    }

    // Métodos privados (solo API)

    /**
     * Obtener poderes desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/poderes/listar');
    }

    /**
     * Buscar poder por ID desde API
     */
    private async findPoderApi(id: string): Promise<ApiResponse> {
        return await this.api.get(`/poderes/${id}`);
    }

    /**
     * Crear poder en API
     */
    private async createPoderApi(poder: Poder): Promise<ApiResponse> {
        return await this.api.post('/poderes/crear', poder);
    }

    /**
     * Actualizar poder en API
     */
    private async updatePoderApi(poder: Poder): Promise<ApiResponse> {
        return await this.api.put(`/poderes/editar/${poder.id}`, poder);
    }

    /**
     * Eliminar poder en API
     */
    private async deletePoderApi(id: string): Promise<ApiResponse> {
        return await this.api.delete(`/poderes/eliminar/${id}`);
    }

    /**
     * Activar poder en API
     */
    private async activarPoderApi(id: string): Promise<ApiResponse> {
        return await this.api.post(`/poderes/activar/${id}`);
    }

    /**
     * Inactivar poder en API
     */
    private async inactivarPoderApi(id: string): Promise<ApiResponse> {
        return await this.api.post(`/poderes/inactivar/${id}`);
    }

    /**
     * Subir archivo masivo a API
     */
    private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
        return await this.api.post('/poderes/cargue-masivo', formData);
    }

    /**
     * Exportar lista desde API
     */
    private async exportListaApi(): Promise<ApiResponse> {
        return await this.api.get('/poderes/exportar-lista');
    }

    /**
     * API para validación previa
     */
    private async validarPoderApi(data: Record<string, string>): Promise<ApiResponse> {
        return await this.api.post('/poderes/validacion-previa', data);
    }

    /**
     * API para buscar empresa
     */
    private async buscarEmpresaApi(nit: string): Promise<ApiResponse> {
        return await this.api.get(`/poderes/buscar-empresa/${nit}`);
    }

    /**
     * API para registrar rechazo
     */
    private async registrarRechazoApi(data: Record<string, any>): Promise<ApiResponse> {
        return await this.api.post('/poderes/registraRechazoPoder', data);
    }
}
