import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import ConsensosCollection from '@/collections/ConsensosCollection';
import Consenso from '@/models/Consenso';

export interface ConsensoServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export interface ConsensoCollections {
    consensos: ConsensosCollection;
}

export default class ConsensoService {
    private storage: BoxCollectionStorage;
    private collections: ConsensoCollections;

    constructor(private readonly opts: ConsensoServiceOptions) {
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
        const consensosStorage = this.storage.getCollection('consensos')?.value;

        // Crear colecciones Backbone si no existen
        this.collections.consensos = (consensosStorage as ConsensosCollection) || new ConsensosCollection();

        // Guardar colecciones en storage si no existen
        if (!consensosStorage) {
            this.storage.addCollection('consensos', this.collections.consensos);
        }
    }

    // Métodos públicos (interfaz para controllers/vistas)

    /**
     * Obtener todos los consensos
     */
    async __findAll(): Promise<void> {
        try {
            const response = await this.findAllApi();
            if (response?.success) {
                this.__setConsensos((response as any).consensos || []);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar consensos' });
            }
        } catch (error: any) {
            this.logger.error('Error al listar consensos:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Establecer lista de consensos
     */
    __setConsensos(consensos: any[]): void {
        this.collections.consensos.reset();
        this.collections.consensos.add(consensos, { merge: true });
    }

    /**
     * Agregar consenso a la colección
     */
    __addConsensos(consenso: any): void {
        const _consenso = consenso instanceof Consenso ? consenso : new Consenso(consenso);
        this.collections.consensos.add(_consenso, { merge: true });
    }

    /**
     * Guardar consenso
     */
    async __saveConsenso(consenso: any): Promise<ApiResponse> {
        try {
            if (!consenso.isValid()) {
                const errors = consenso.validationError;
                this.App.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveConsensoApi(consenso.toJSON());

            if (response?.success) {
                this.App.trigger('alert:success', { message: response.msj || 'Consenso guardado exitosamente' });
                this.__addConsensos((response as any).consenso);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar consenso:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Consenso eliminado exitosamente' });
                this.collections.consensos.remove(consenso);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar consenso:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Consenso activado exitosamente' });
                // Actualizar el modelo en la colección
                if (consenso.set) {
                    consenso.set('estado', 'activo');
                }
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al activar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar consenso:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Consenso inactivado exitosamente' });
                // Actualizar el modelo en la colección
                if (consenso.set) {
                    consenso.set('estado', 'inactivo');
                }
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al inactivar consenso' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar consenso:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    // Métodos privados (solo Service)

    /**
     * Obtener consensos desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/consensos/listar');
    }

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
