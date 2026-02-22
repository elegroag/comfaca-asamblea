import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import type { RechazoModel } from '@/componentes/rechazos/models/RechazoModel';

export interface RechazoServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export interface RechazoCollections {
    rechazos: any; // RechazosCollection si existe
}

export default class RechazoService {
    private storage: BoxCollectionStorage;
    private collections: RechazoCollections;

    constructor(private readonly opts: RechazoServiceOptions) {
        this.storage = BoxCollectionStorage.getInstance();
        this.__initializeCollections();
    }

    private get api() { return this.opts.api; }
    private get logger() { return this.opts.logger; }
    private get App() { return this.opts.app; }

    /**
     * Inicializar las colecciones necesarias usando BoxCollectionStorage
     */
    private __initializeCollections(): void {
        // Inicializar colecciones persistentes en localStorage
        const rechazosStorage = this.storage.getCollection('rechazos')?.value;

        // Crear colecciones Backbone si no existen
        this.collections.rechazos = rechazosStorage || new (this.App as any).Collection();

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
                this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar rechazos' });
            }
        } catch (error: any) {
            this.logger.error('Error al listar rechazos:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
     * Guardar rechazo
     */
    async __saveRechazo(model: any): Promise<ApiResponse> {
        try {
            const response = await this.saveRechazoApi(model.toJSON());

            if (response?.success) {
                this.App.trigger('alert:success', { message: response.msj || 'Rechazo guardado exitosamente' });
                this.__addRechazos((response as any).rechazo);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar rechazo:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar rechazo
     */
    async __removeRechazo(rechazo: any): Promise<ApiResponse> {
        try {
            const response = await this.removeRechazoApi(rechazo.toJSON());

            if (response?.success) {
                this.App.trigger('alert:success', { message: response.msj || 'Rechazo eliminado exitosamente' });
                this.collections.rechazos.remove(rechazo);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar rechazo' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar rechazo:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Cargue masivo exitoso' });
                await this.__findAll(); // Recargar datos
                callback(true, response);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error en el cargue masivo' });
                callback(false);
            }
        } catch (error: any) {
            this.logger.error('Error en cargue masivo:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
        return await this.api.post('/rechazos/cargue_masivo', formData);
    }
}
