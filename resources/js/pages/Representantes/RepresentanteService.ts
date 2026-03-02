import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import Representante from '@/models/Representante';

export interface RepresentanteServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export default class RepresentanteService {
    constructor(private readonly opts: RepresentanteServiceOptions) {
        // SIN storage/persistencia local - solo API
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Obtener todos los representantes desde API
     */
    async findAllRepresentantes(): Promise<any> {
        try {
            const response = await this.api.get('/representantes/listar');
            if (response?.success) {
                return response;
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al listar representantes' });
                return null;
            }
        } catch (error: any) {
            this.logger?.error('Error al listar representantes:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar representantes' });
            return null;
        }
    }

    /**
     * Guardar representante
     */
    async __saveRepresentante(representante: any): Promise<ApiResponse> {
        try {
            if (!representante.isValid()) {
                const errors = representante.validationError;
                this.app.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveRepresentanteApi(representante.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Representante guardado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al guardar representante' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar representante:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar representante
     */
    async __removeRepresentante(representante: any): Promise<ApiResponse> {
        try {
            const response = await this.removeRepresentanteApi(representante.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Representante eliminado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al eliminar representante' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar representante:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Buscar representante por ID
     */
    async findByRepresentante(id: string): Promise<any> {
        try {
            const response = await this.api.get(`/representantes/${id}`);
            if (response?.success) {
                return response;
            } else {
                this.logger.error('Error al buscar representante:', (response as any).msj);
                return null;
            }
        } catch (error: any) {
            this.logger.error('Error al buscar representante:', error);
            return null;
        }
    }

    /**
     * Cargar archivo de representantes masivo
     */
    async __uploadMasivo(file: File): Promise<ApiResponse> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await this.uploadMasivoApi(formData);

            if (response?.success) {
                this.app.trigger('alert:success', { message: (response as any).msj || 'Archivo procesado exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: (response as any).msj || 'Error al procesar archivo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al cargar archivo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Exportar lista de representantes
     */
    async __exportLista(): Promise<void> {
        try {
            const response = await this.exportListaApi();
            if (response?.success) {
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.href = response.url;
                link.download = response.filename || 'representantes.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al exportar lista' });
            }
        } catch (error: any) {
            this.logger.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Exportar informe de representantes
     */
    async __exportInforme(): Promise<void> {
        try {
            const response = await this.exportInformeApi();
            if (response?.success) {
                // Crear enlace de descarga
                const link = document.createElement('a');
                link.href = response.url;
                link.download = response.filename || 'informe_representantes.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                this.app?.trigger('alert:error', { message: (response as any).msj || 'Error al exportar informe' });
            }
        } catch (error: any) {
            this.logger.error('Error al exportar informe:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Buscar representantes por criterio
     */
    async __buscarRepresentantes(criterio: string): Promise<any[]> {
        try {
            const response = await this.buscarRepresentantesApi(criterio);
            if (response?.success) {
                return response.representantes || [];
            } else {
                this.logger.error('Error al buscar representantes:', (response as any).msj);
                return [];
            }
        } catch (error: any) {
            this.logger.error('Error al buscar representantes:', error);
            return [];
        }
    }

    /**
     * Obtener representantes por empresa
     */
    async __getPorEmpresa(empresaId: string): Promise<any[]> {
        try {
            const response = await this.getPorEmpresaApi(empresaId);
            if (response?.success) {
                return response.representantes || [];
            } else {
                this.logger.error('Error al obtener representantes por empresa:', (response as any).msj);
                return [];
            }
        } catch (error: any) {
            this.logger.error('Error al obtener representantes por empresa:', error);
            return [];
        }
    }

    // Métodos privados (solo Service)

    /**
     * Guardar representante en API
     */
    private async saveRepresentanteApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/representantes/saveRepresentante', data);
    }

    /**
     * Eliminar representante en API
     */
    private async removeRepresentanteApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/representantes/removeRepresentante', data);
    }

    /**
     * Cargar archivo masivo en API
     */
    private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
        return await this.api.post('/representantes/uploadMasivo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    /**
     * Exportar lista en API
     */
    private async exportListaApi(): Promise<ApiResponse> {
        return await this.api.get('/representantes/exportLista');
    }

    /**
     * Exportar informe en API
     */
    private async exportInformeApi(): Promise<ApiResponse> {
        return await this.api.get('/representantes/exportInforme');
    }

    /**
     * Buscar representantes en API
     */
    private async buscarRepresentantesApi(criterio: string): Promise<ApiResponse> {
        return await this.api.get(`/representantes/buscar?q=${encodeURIComponent(criterio)}`);
    }

    /**
     * Obtener representantes por empresa en API
     */
    private async getPorEmpresaApi(empresaId: string): Promise<ApiResponse> {
        return await this.api.get(`/representantes/porEmpresa/${empresaId}`);
    }
}