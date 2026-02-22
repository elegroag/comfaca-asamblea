import { CommonDeps, ServiceOptions, ApiResponse, FileUploadTransfer } from '@/types/CommonDeps';
import CarterasCollection from '@/collections/CarterasCollection';
import RepresentantesCollection from '@/collections/RepresentantesCollection';
import EmpresasCollection from '@/collections/EmpresasCollection';
import { BoxCollectionStorage } from '@/componentes/useStorage';
import type { Cartera, CarteraCreateRequest, CarteraUpdateRequest, CarteraResponse, CarteraListarResponse, CarteraDetalleResponse } from './types';

export interface CarteraServiceOptions extends ServiceOptions {
    // Opciones adicionales específicas del servicio si se necesitan
}

export interface CarteraCollections {
    empresas: EmpresasCollection;
    carteras: CarterasCollection;
    representantes: RepresentantesCollection;
    poderes: any; // PoderCollection si existe
}

export default class CarteraService {
    private storage: BoxCollectionStorage;
    private collections: CarteraCollections;

    constructor(private readonly opts: CarteraServiceOptions) {
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
        const empresasStorage = this.storage.getCollection('empresas')?.value;
        const carterasStorage = this.storage.getCollection('carteras')?.value;
        const representantesStorage = this.storage.getCollection('representantes')?.value;
        const poderesStorage = this.storage.getCollection('poderes')?.value;

        // Crear colecciones Backbone si no existen
        this.collections.empresas = (empresasStorage as EmpresasCollection) || new EmpresasCollection();
        this.collections.carteras = (carterasStorage as CarterasCollection) || new CarterasCollection();
        this.collections.representantes = (representantesStorage as RepresentantesCollection) || new RepresentantesCollection();
        this.collections.poderes = poderesStorage || new (this.App as any).Collection();

        // Guardar colecciones en storage si no existen
        if (!empresasStorage) {
            this.storage.addCollection('empresas', this.collections.empresas);
        }
        if (!carterasStorage) {
            this.storage.addCollection('carteras', this.collections.carteras);
        }
        if (!representantesStorage) {
            this.storage.addCollection('representantes', this.collections.representantes);
        }
        if (!poderesStorage) {
            this.storage.addCollection('poderes', this.collections.poderes);
        }
    }

    // Métodos públicos (interfaz para controllers/vistas)

    /**
     * Obtener todas las carteras
     */
    async __findAll(): Promise<void> {
        try {
            const response = await this.findAllApi();
            if (response?.success) {
                this.__setCarteras((response as any).carteras || []);
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al cargar carteras' });
            }
        } catch (error: any) {
            this.logger.error('Error al listar carteras:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    /**
     * Establecer lista de carteras
     */
    __setCarteras(carteras: Cartera[]): void {
        this.collections.carteras.reset();
        this.collections.carteras.add(carteras, { merge: true });
    }

    /**
     * Agregar cartera a la colección
     */
    __addCartera(cartera: Cartera): void {
        this.collections.carteras.add(cartera, { merge: true });
    }

    /**
     * Remover cartera de la colección
     */
    __removeCartera(cartera: Cartera): void {
        this.collections.carteras.remove(cartera);
    }

    /**
     * Guardar cartera (crear o actualizar)
     */
    async __saveCartera(cartera: Cartera): Promise<ApiResponse> {
        try {
            const response = cartera.id
                ? await this.updateCarteraApi(cartera)
                : await this.createCarteraApi(cartera);

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Cartera guardada exitosamente' });
                this.__addCartera((response as any).cartera);
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al guardar cartera' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al guardar cartera:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Eliminar cartera
     */
    async __deleteCartera(id: string): Promise<ApiResponse> {
        try {
            const response = await this.deleteCarteraApi(id);

            if (response?.success) {
                this.app.trigger('alert:success', { message: response.msj || 'Cartera eliminada exitosamente' });
                const cartera = this.collections.carteras.get(id);
                if (cartera) {
                    this.__removeCartera(cartera);
                }
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al eliminar cartera' });
            }

            return response;
        } catch (error: any) {
            this.logger.error('Error al eliminar cartera:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
            return { success: false, message: error.message };
        }
    }

    /**
     * Cargue masivo de carteras
     */
    async __uploadMasivo({ formData, callback }: FileUploadTransfer): Promise<void> {
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

    /**
     * Exportar lista de carteras
     */
    async __exportLista(): Promise<void> {
        try {
            const response = await this.exportListaApi();

            if (response?.success && response.url) {
                this.app.download({
                    url: response.url,
                    filename: response.filename || 'carteras.csv'
                });
            } else {
                this.app.trigger('alert:error', { message: response?.msj || 'Error al exportar lista' });
            }
        } catch (error: any) {
            this.logger.error('Error al exportar lista:', error);
            this.app.trigger('alert:error', { message: error.message || 'Error de conexión' });
        }
    }

    // Métodos privados (solo Service)

    /**
     * Obtener carteras desde API
     */
    private async findAllApi(): Promise<ApiResponse> {
        return await this.api.get('/cartera/listar');
    }

    /**
     * Crear cartera en API
     */
    private async createCarteraApi(cartera: CarteraCreateRequest): Promise<ApiResponse> {
        return await this.api.post('/cartera/crear', cartera);
    }

    /**
     * Actualizar cartera en API
     */
    private async updateCarteraApi(cartera: CarteraUpdateRequest): Promise<ApiResponse> {
        return await this.api.put(`/cartera/editar/${cartera.id}`, cartera);
    }

    /**
     * Eliminar cartera en API
     */
    private async deleteCarteraApi(id: string): Promise<ApiResponse> {
        return await this.api.delete(`/cartera/eliminar/${id}`);
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
