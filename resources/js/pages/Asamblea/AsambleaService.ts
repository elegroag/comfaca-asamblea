import { CommonDeps, ServiceOptions, ApiResponse, FileUploadTransfer } from '@/types/CommonDeps';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import AsambleasCollection from '@/collections/AsambleasCollection';
import ConsensosCollection from '@/collections/ConsensosCollection';
import type { Asamblea } from './types';

export interface AsambleaServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export interface AsambleaCollections {
    asambleas: AsambleasCollection;
    participantes: any; // ParticipantesCollection si existe
    consensos: ConsensosCollection;
}

export default class AsambleaService {
    private storage: BoxCollectionStorage;
    private collections: AsambleaCollections;

    constructor(private readonly opts: AsambleaServiceOptions) {
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
        const asambleasStorage = this.storage.getCollection('asambleas')?.value;
        const participantesStorage = this.storage.getCollection('participantes')?.value;
        const consensosStorage = this.storage.getCollection('consensos')?.value;

        // Crear colecciones Backbone si no existen
        this.collections.asambleas = (asambleasStorage as AsambleasCollection) || new AsambleasCollection();
        this.collections.participantes = participantesStorage || new (this.App as any).Collection();
        this.collections.consensos = (consensosStorage as ConsensosCollection) || new ConsensosCollection();

        // Guardar colecciones en storage si no existen
        if (!asambleasStorage) {
            this.storage.addCollection('asambleas', this.collections.asambleas);
        }
        if (!participantesStorage) {
            this.storage.addCollection('participantes', this.collections.participantes);
        }
        if (!consensosStorage) {
            this.storage.addCollection('consensos', this.collections.consensos);
        }
    }

    // Métodos públicos (interfaz para controllers/vistas)

    /**
     * Obtener todas las asambleas
     */
    async __findAll(): Promise<void> {
        try {
            const response = await this.findAllApi();
            if (response?.success) {
                this.__setAsambleas((response as any).asambleas || []);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al cargar asambleas' });
            }
        } catch (error: any) {
            this.logger.error('Error al listar asambleas:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Establecer lista de asambleas
     */
    __setAsambleas(asambleas: Asamblea[]): void {
        this.collections.asambleas.reset();
        this.collections.asambleas.add(asambleas, { merge: true });
    }

    /**
     * Agregar asamblea a la colección
     */
    __addAsamblea(asamblea: Asamblea): void {
        this.collections.asambleas.add(asamblea, { merge: true });
    }

    /**
     * Remover asamblea de la colección
     */
    __removeAsamblea(asamblea: Asamblea): void {
        this.collections.asambleas.remove(asamblea);
    }

    /**
     * Guardar asamblea (crear o actualizar)
     */
    async __saveAsamblea(asamblea: Asamblea): Promise<ApiResponse> {
        try {
            const response = asamblea.id
                ? await this.updateAsambleaApi(asamblea)
                : await this.createAsambleaApi(asamblea);

            if (response?.success) {
                this.App.trigger('alert:success', { message: response.msj || 'Asamblea guardada exitosamente' });
                this.__addAsamblea((response as any).asamblea);
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al guardar asamblea' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar asamblea:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar asamblea
     */
    async __deleteAsamblea(id: string): Promise<ApiResponse> {
        try {
            const response = await this.deleteAsambleaApi(id);

            if (response?.success) {
                this.App.trigger('alert:success', { message: response.msj || 'Asamblea eliminada exitosamente' });
                const asamblea = this.collections.asambleas.get(id);
                if (asamblea) {
                    this.__removeAsamblea(asamblea);
                }
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al eliminar asamblea' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar asamblea:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
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
                this.App.trigger('alert:success', { message: response.msj || 'Asamblea activada exitosamente' });
                // Actualizar la asamblea en la colección
                const asamblea = this.collections.asambleas.get(id);
                if (asamblea) {
                    asamblea.set('estado', 'activa');
                }
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al activar asamblea' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al activar asamblea:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Exportar lista de asambleas
     */
    async __exportLista(): Promise<void> {
        try {
            const response = await this.exportListaApi();

            if (response?.success && response.url) {
                this.App.download({
                    url: response.url,
                    filename: response.filename || 'asambleas.csv'
                });
            } else {
                this.App.trigger('alert:error', { message: response?.msj || 'Error al exportar lista' });
            }
        } catch (error: any) {
            this.logger.error('Error al exportar lista:', error);
            this.App.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    // Métodos privados (solo Service)

    /**
     * Obtener asambleas desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/asamblea/listar');
    }

    /**
     * Crear asamblea en API
     */
    private async createAsambleaApi(asamblea: Asamblea): Promise<ApiResponse> {
        return await this.api.post('/asamblea/crear', asamblea);
    }

    /**
     * Actualizar asamblea en API
     */
    private async updateAsambleaApi(asamblea: Asamblea): Promise<ApiResponse> {
        return await this.api.put(`/asamblea/editar/${asamblea.id}`, asamblea);
    }

    /**
     * Eliminar asamblea en API
     */
    private async deleteAsambleaApi(id: string): Promise<ApiResponse> {
        return await this.api.delete(`/asamblea/eliminar/${id}`);
    }

    /**
     * Activar asamblea en API
     */
    private async activarAsambleaApi(id: string): Promise<ApiResponse> {
        return await this.api.post(`/asamblea/activar/${id}`);
    }

    /**
     * Exportar lista desde API
     */
    private async exportListaApi(): Promise<ApiResponse> {
        return await this.api.get('/asamblea/exportar_lista');
    }
}
