import { CommonDeps, ServiceOptions, ApiResponse } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import MesasCollection from '@/collections/MesasCollection';
import Mesa from '@/models/Mesa';

export interface MesasServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export interface MesasCollections {
    mesas: MesasCollection;
}

export default class MesasService {
    private storage: BoxCollectionStorage;
    private collections: MesasCollections;

    constructor(private readonly opts: MesasServiceOptions) {
        this.storage = BoxCollectionStorage.getInstance();
        this.collections = {
            mesas: new MesasCollection()
        };
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
        const mesasStorage = this.storage.getCollection('mesas')?.value;

        // Crear colecciones Backbone si no existen
        this.collections.mesas = (mesasStorage as MesasCollection) || new MesasCollection();

        // Guardar colecciones en storage si no existen
        if (!mesasStorage) {
            this.storage.addCollection('mesas', this.collections.mesas);
        }
    }

    // Métodos públicos (interfaz para controllers/vistas)

    /**
     * Obtener todas las mesas
     */
    async __findAll(): Promise<void> {
        try {
            const response = await this.findAllApi();
            if (response?.success) {
                this.__setMesas((response as any).mesas || []);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar mesas' });
            }
        } catch (error: any) {
            this.logger.error('Error al listar mesas:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Establecer lista de mesas
     */
    __setMesas(mesas: any[]): void {
        this.collections.mesas.reset();
        this.collections.mesas.add(mesas, { merge: true });
    }

    /**
     * Agregar mesa a la colección
     */
    __addMesas(mesa: any): void {
        const _mesa = mesa instanceof Mesa ? mesa : new Mesa(mesa);
        this.collections.mesas.add(_mesa, { merge: true });
    }

    /**
     * Guardar mesa
     */
    async __saveMesa(mesa: any): Promise<ApiResponse> {
        try {
            if (!mesa.isValid()) {
                const errors = mesa.validationError;
                this.App.trigger('alert:error', errors.toString());
                return { success: false, message: errors.toString() };
            }

            const response = await this.saveMesaApi(mesa.toJSON());

            if (response?.success) {
                this.App.trigger('alert:success', { message: response.msj || 'Mesa guardada exitosamente' });
                this.__addMesas((response as any).mesa);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar mesa:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Mesa eliminada exitosamente' });
                this.collections.mesas.remove(mesa);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar mesa:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Mesa activada exitosamente' });
                // Actualizar el modelo en la colección
                if (mesa.set) {
                    mesa.set('estado', 'activo');
                }
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al activar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar mesa:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Mesa inactivada exitosamente' });
                // Actualizar el modelo en la colección
                if (mesa.set) {
                    mesa.set('estado', 'inactivo');
                }
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al inactivar mesa' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al inactivar mesa:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Validar poder previamente
     */
    async __validarPoder(data: Record<string, string>): Promise<ApiResponse> {
        try {
            const response = await this.validarPoderApi(data);
            return response;
        } catch (error: any) {
            this.logger.error('Error al validar poder:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
            throw error;
        }
    }

    /**
     * Buscar mesas por criterio
     */
    async __buscarMesas(criterio: string): Promise<any[]> {
        try {
            const response = await this.buscarMesasApi(criterio);
            return response?.success ? (response as any).mesas || [] : [];
        } catch (error: any) {
            this.logger.error('Error al buscar mesas:', error);
            return [];
        }
    }

    // Métodos privados (solo Service)

    /**
     * Obtener mesas desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/mesas/listar');
    }

    /**
     * Validar poder en API
     */
    private async validarPoderApi(data: Record<string, string>): Promise<ApiResponse> {
        // Enviar datos directamente como JSON
        return await this.api.post('/poderes/validacion_previa', data);
    }

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
     * Buscar mesas en API
     */
    private async buscarMesasApi(criterio: string): Promise<ApiResponse> {
        return await this.api.get(`/mesas/buscar?criterio=${encodeURIComponent(criterio)}`);
    }
}
