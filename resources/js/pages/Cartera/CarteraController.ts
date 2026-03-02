import { Controller } from "@/common/Controller";
import CargueMasivoCartera from "@/componentes/cartera/views/CargueMasivoCartera";
import CarteraCrear from "@/componentes/cartera/views/CarteraCrear";
import CarteraDetalle from "@/componentes/cartera/views/CarteraDetalle";
import CarterasListar from "@/componentes/cartera/views/CarterasListar";
import Cartera from "@/models/Cartera";
import CarterasCollection from "@/collections/CarterasCollection";
import CarteraService from "./CarteraService";
import { cacheCollection, cacheModel } from '@/componentes/CacheManager';

export default class CarteraController extends Controller {
    carteraService: CarteraService;
    private carterasCollection: CarterasCollection;

    constructor(options: any) {
        super(options);

        this.carteraService = new CarteraService({
            api: this.api,
            app: this.app!,
            logger: this.logger!,
        });

        // Inicializar colección de carteras
        this.carterasCollection = new CarterasCollection();
    }

    /**
     * Listar todas las carteras
     */
    async listaCartera(): Promise<void> {
        try {
            // Obtener datos desde el servicio
            const response = await this.carteraService.findAllCarteras();

            if (response?.success) {
                // Actualizar colección con los datos del servidor
                this.carterasCollection.reset();
                this.carterasCollection.add(response.data || []);

                // Guardar en cache para uso futuro
                cacheCollection('carteras', this.carterasCollection, {
                    persistent: false, // Solo en memoria para datos transaccionales
                    ttl: 5 * 60 * 1000 // 5 minutos
                });
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al cargar carteras' });
                return;
            }

            const view = new CarterasListar({
                collection: this.carterasCollection,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el controller
            this.listenTo(view, 'remove:cartera', this.handleRemoveCartera.bind(this));
            this.listenTo(view, 'edit:cartera', this.editaCartera.bind(this));
            this.listenTo(view, 'show:cartera', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'activar:cartera', this.handleActivarCartera.bind(this));
            this.listenTo(view, 'inactivar:cartera', this.handleInactivarCartera.bind(this));
            this.listenTo(view, 'export:lista', this.handleExportLista.bind(this));
            this.listenTo(view, 'file:upload', this.handleUploadMasivo.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar carteras:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar carteras');
        }
    }

    /**
     * Manejar eliminación de cartera
     */
    async handleRemoveCartera(options: { model: Cartera, removeFromCollection?: boolean }): Promise<void> {
        const { model, removeFromCollection = true } = options;

        try {
            const response = await this.carteraService.removeCartera(model.id);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Cartera eliminada exitosamente' });

                if (removeFromCollection) {
                    this.carterasCollection.remove(model);
                }
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al eliminar cartera' });
            }
        } catch (error: any) {
            this.logger?.error('Error al eliminar cartera:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar activación de cartera
     */
    async handleActivarCartera(options: { model: Cartera, updateCollection?: boolean }): Promise<void> {
        const { model, updateCollection = true } = options;

        try {
            const response = await this.carteraService.activarCartera(model.id);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Cartera activada exitosamente' });

                if (updateCollection) {
                    // Actualizar el modelo en la colección con los datos de respuesta
                    const updatedModel = response.data;
                    if (updatedModel) {
                        const existingModel = this.carterasCollection.get(model.id);
                        if (existingModel) {
                            existingModel.set(updatedModel);
                        }
                    }
                }
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al activar cartera' });
            }
        } catch (error: any) {
            this.logger?.error('Error al activar cartera:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar inactivación de cartera
     */
    async handleInactivarCartera(options: { model: Cartera, updateCollection?: boolean }): Promise<void> {
        const { model, updateCollection = true } = options;

        try {
            const response = await this.carteraService.inactivarCartera(model.id);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Cartera inactivada exitosamente' });

                if (updateCollection) {
                    // Actualizar el modelo en la colección con los datos de respuesta
                    const updatedModel = response.data;
                    if (updatedModel) {
                        const existingModel = this.carterasCollection.get(model.id);
                        if (existingModel) {
                            existingModel.set(updatedModel);
                        }
                    }
                }
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al inactivar cartera' });
            }
        } catch (error: any) {
            this.logger?.error('Error al inactivar cartera:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar exportación de lista
     */
    async handleExportLista(): Promise<void> {
        try {
            const response = await this.carteraService.exportLista();

            if (response?.success && response.url) {
                this.app?.download({
                    url: response.url,
                    filename: response.filename || 'carteras.csv'
                });
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al exportar lista' });
            }
        } catch (error: any) {
            this.logger?.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar cargue masivo
     */
    async handleUploadMasivo(options: { formData: FormData, callback?: (success: boolean, response?: any) => void }): Promise<void> {
        const { formData, callback } = options;

        try {
            const response = await this.carteraService.uploadMasivo({
                formData,
                callback: () => { }
            });

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Cargue masivo exitoso' });

                // Recargar la lista de carteras
                await this.listaCartera();

                callback?.(true, response);
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error en el cargue masivo' });
                callback?.(false);
            }
        } catch (error: any) {
            this.logger?.error('Error en cargue masivo:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
            callback?.(false);
        }
    }

    /**
     * Mostrar vista de creación de cartera
     */
    crearCartera(): void {
        const view = new CarteraCrear({
            model: new Cartera(),
            isNew: true,
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el controller
        this.listenTo(view, 'save:cartera', this.handleSaveCartera.bind(this));
    }

    /**
     * Manejar guardado de cartera
     */
    async handleSaveCartera(options: { model: Cartera, callback?: (success: boolean, response?: any) => void }): Promise<void> {
        const { model, callback } = options;

        try {
            const response = await this.carteraService.saveCartera(model);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Cartera guardada exitosamente' });

                // Agregar o actualizar en la colección
                if (model.isNew()) {
                    this.carterasCollection.add(response.data);
                } else {
                    const existingModel = this.carterasCollection.get(model.id);
                    if (existingModel) {
                        existingModel.set(response.data);
                    }
                }

                callback?.(true, response);
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al guardar cartera' });
                callback?.(false);
            }
        } catch (error: any) {
            this.logger?.error('Error al guardar cartera:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
            callback?.(false);
        }
    }

    /**
     * Editar una cartera existente
     */
    async editaCartera(id: string): Promise<void> {
        try {
            // Buscar la cartera en la colección primero
            let model = this.carterasCollection.get(id);

            // Si no está en la colección, buscarla en el servicio
            if (!model) {
                const response = await this.carteraService.findCartera(id);
                if (response?.success && response.data) {
                    model = new Cartera(response.data);
                } else {
                    this.app?.trigger('alert:error', 'Cartera no encontrada');
                    return;
                }
            }

            const view = new CarteraCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el controller
            this.listenTo(view, 'save:cartera', this.handleSaveCartera.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al editar cartera:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar cartera');
        }
    }

    /**
     * Mostrar detalle de una cartera
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            // Buscar la cartera en la colección primero
            let model = this.carterasCollection.get(id);

            // Si no está en la colección, buscarla en el servicio
            if (!model) {
                const response = await this.carteraService.findCartera(id);
                if (response?.success && response.data) {
                    model = new Cartera(response.data);
                } else {
                    this.app?.trigger('alert:error', 'Cartera no encontrada');
                    return;
                }
            }

            const view = new CarteraDetalle({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar cartera');
        }
    }

    /**
     * Cargue masivo de carteras
     */
    cargueMasivoCartera(): void {
        const view = new CargueMasivoCartera({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el controller
        this.listenTo(view, 'file:upload', this.handleUploadMasivo.bind(this));
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Cartera');
    }
}
