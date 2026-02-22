import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import RechazoModel from '@/componentes/rechazos/models/RechazoModel';

export interface RechazoServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export interface RechazoCollections {
    rechazos: any; // RechazosCollection si existe
}

export default class RechazoService {
    private storage: BoxCollectionStorage;
    private collections: RechazoCollections = {
        rechazos: null as any
    };

    constructor(private readonly opts: RechazoServiceOptions) {
        this.storage = BoxCollectionStorage.getInstance();
        this.__initializeCollections();
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get app() { return this.opts.app; }

    /**
     * Inicializar las colecciones necesarias usando BoxCollectionStorage
     */
    private __initializeCollections(): void {
        // Inicializar colecciones persistentes en localStorage
        const rechazosStorage = this.storage.getCollection('rechazos')?.value;

        // Crear colecciones Backbone si no existen
        this.collections.rechazos = rechazosStorage || new (this.app as any).Collection();

        // Guardar colecciones en storage si no existen
        if (!rechazosStorage) {
            this.storage.addCollection('rechazos', this.collections.rechazos);
        }
    }

    // Métodos públicos (interfaz para controllers/vistas)

    /**
     * Obtener todos los rechazos
     */
    async __findAll(): Promise<void> {
        try {
            const response = await this.findAllApi();
            if (response?.success) {
                this.__setRechazos((response as any).rechazos || []);
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al cargar rechazos' });
            }
        } catch (error: any) {
            this.logger.error('Error al listar rechazos:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Establecer lista de rechazos
     */
    __setRechazos(rechazos: any[]): void {
        this.collections.rechazos.reset();
        this.collections.rechazos.add(rechazos, { merge: true });
    }

    /**
     * Agregar rechazo a la colección
     */
    __addRechazos(rechazo: any): void {
        const _rechazo = rechazo instanceof RechazoModel ? rechazo : new RechazoModel(rechazo);
        this.collections.rechazos.add(_rechazo, { merge: true });
    }

    /**
     * Métodos públicos para compatibilidad con eventos de Backbone
     */
    setRechazos(rechazos: any[]): void {
        this.__setRechazos(rechazos);
    }

    addRechazos(rechazo: any): void {
        this.__addRechazos(rechazo);
    }

    saveRechazo(model: any): Promise<ApiResponse> {
        return this.__saveRechazo(model);
    }

    notifyPlataforma(model: any): Promise<void> {
        return this.__notifyPlataforma(model);
    }

    /**
     * Guardar rechazo
     */
    async __saveRechazo(model: any): Promise<ApiResponse> {
        try {
            const response = await this.saveRechazoApi(model.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Rechazo guardado exitosamente' });
                this.__addRechazos((response as any).rechazo);
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al guardar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar rechazo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    async __notifyPlataforma(model: any): Promise<void> {
        try {
            const response = await this.notifyPlataformaApi(model.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Notificación enviada exitosamente' });
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al enviar notificación' });
            }
        } catch (error: any) {
            this.logger.error('Error al enviar notificación:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    notifyPlataformaApi(data: any): Promise<ApiResponse> {
        return this.api.post('rechazos/notifyPlataforma', data);
    }

    /**
     * Eliminar rechazo
     */
    async __removeRechazo(rechazo: any): Promise<ApiResponse> {
        try {
            const response = await this.removeRechazoApi(rechazo.toJSON());

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Rechazo eliminado exitosamente' });
                this.collections.rechazos.remove(rechazo);
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al eliminar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar rechazo:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Cargue masivo de rechazos
     */
    async __uploadMasivo({ formData, callback }: any): Promise<void> {
        try {
            const response = await this.uploadMasivoApi(formData);

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Cargue masivo exitoso' });
                await this.__findAll(); // Recargar datos
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

    // Métodos privados (solo Service)

    /**
     * Obtener rechazos desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/rechazos/listar');
    }

    /**
     * Guardar rechazo en API
     */
    private async saveRechazoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/rechazos/saveRechazo', data);
    }

    /**
     * Eliminar rechazo en API
     */
    private async removeRechazoApi(data: any): Promise<ApiResponse> {
        return await this.api.post('/rechazos/removeRechazo', data);
    }

    /**
     * Subir archivo masivo a API
     */
    private async uploadMasivoApi(formData: FormData): Promise<ApiResponse> {
        return await this.api.upload('/rechazos/uploadMasivo', formData);
    }

    /**
     * Crear rechazo en API
     */
    async __crearRechazo(data: Record<string, any>): Promise<ApiResponse> {
        try {
            const response = await this.saveRechazoApi(data);
            return response;
        } catch (error: any) {
            this.logger.error('Error al crear rechazo:', error);
            throw error;
        }
    }

    /**
     * Actualizar rechazo en API
     */
    async __actualizarRechazo(data: Record<string, any>): Promise<ApiResponse> {
        try {
            const response = await this.updateRechazoApi(data);
            return response;
        } catch (error: any) {
            this.logger.error('Error al actualizar rechazo:', error);
            throw error;
        }
    }

    /**
     * API para actualizar rechazo
     */
    private async updateRechazoApi(data: Record<string, any>): Promise<ApiResponse> {
        return await this.api.post('/rechazos/updateRechazo', data);
    }

    /**
     * Cargar rechazos masivamente en API
     */
    async __cargarMasivo(formData: FormData): Promise<ApiResponse> {
        try {
            const response = await this.uploadMasivoApi(formData);
            return response;
        } catch (error: any) {
            this.logger.error('Error al cargar rechazos masivo:', error);
            throw error;
        }
    }

    /**
     * Exportar lista de rechazos en API
     */
    async __exportarLista(): Promise<ApiResponse> {
        try {
            const response = await this.exportarListaApi();
            return response;
        } catch (error: any) {
            this.logger.error('Error al exportar lista:', error);
            throw error;
        }
    }

    /**
     * API para exportar lista
     */
    private async exportarListaApi(): Promise<ApiResponse> {
        return await this.api.get('/rechazos/exportar_lista');
    }

    /**
     * Exportar PDF de rechazos en API
     */
    async __exportarPdf(): Promise<ApiResponse> {
        try {
            const response = await this.exportarPdfApi();
            return response;
        } catch (error: any) {
            this.logger.error('Error al exportar PDF:', error);
            throw error;
        }
    }

    /**
     * API para exportar PDF
     */
    private async exportarPdfApi(): Promise<ApiResponse> {
        return await this.api.get('/rechazos/exportar_pdf');
    }

    /**
     * Buscar criterios para rechazos
     */
    async __buscarCriterios(): Promise<ApiResponse> {
        try {
            const response = await this.buscarCriteriosApi();
            return response;
        } catch (error: any) {
            this.logger.error('Error al buscar criterios:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * API para buscar criterios
     */
    private async buscarCriteriosApi(): Promise<ApiResponse> {
        return await this.api.get('/rechazos/buscarCriterios');
    }

    /**
     * Descargar archivo
     */
    download_file(response: any): void {
        try {
            // Crear un blob con los datos de respuesta
            const blob = new Blob([response.data], {
                type: response.type || 'application/octet-stream'
            });

            // Crear URL temporal
            const url = window.URL.createObjectURL(blob);

            // Crear enlace temporal y hacer clic
            const link = document.createElement('a');
            link.href = url;
            link.download = response.filename || 'archivo';
            document.body.appendChild(link);
            link.click();

            // Limpiar
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            this.logger?.info('Archivo descargado exitosamente');
        } catch (error: any) {
            this.logger?.error('Error al descargar archivo:', error);
            throw error;
        }
    }
}
