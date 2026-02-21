import { Controller } from "@/common/Controller";
import CargueMasivoCartera from "@/componentes/cartera/views/CargueMasivoCartera";
import CarteraCrear from "@/componentes/cartera/views/CarteraCrear";
import CarteraDetalle from "@/componentes/cartera/views/CarteraDetalle";
import CarterasListar from "@/componentes/cartera/views/CarterasListar";
import Cartera from "@/models/Cartera";
import type { CarteraTransfer } from "./types";
import RepresentantesCollection from "@/collections/RepresentantesCollection";
import CarterasCollection from "@/collections/CarterasCollection";
import { BoxCollectionStorage } from "@/componentes/useStorage";

export default class CarteraController extends Controller {
    Collections: any = {};
    private storage: BoxCollectionStorage;

    constructor(options: any) {
        super(options);
        this.storage = BoxCollectionStorage.getInstance();
        this.__initializeCollections();
    }

    /**
     * Inicializar las colecciones necesarias usando BoxCollectionStorage
     */
    private __initializeCollections(): void {
        // Inicializar colecciones persistentes en localStorage
        this.Collections.empresas = this.storage.getCollection('empresas')?.value || null;
        this.Collections.carteras = this.storage.getCollection('carteras')?.value || null;
        this.Collections.representantes = this.storage.getCollection('representantes')?.value || null;
        this.Collections.poderes = this.storage.getCollection('poderes')?.value || null;

        // Crear colecciones Backbone si no existen
        if (!this.Collections.empresas) {
            this.Collections.empresas = new (this.App as any).Collection();
            this.storage.addCollection('empresas', this.Collections.empresas);
        }
        if (!this.Collections.carteras) {
            this.Collections.carteras = new CarterasCollection();
            this.storage.addCollection('carteras', this.Collections.carteras);
        }
        if (!this.Collections.representantes) {
            this.Collections.representantes = new RepresentantesCollection();
            this.storage.addCollection('representantes', this.Collections.representantes);
        }
        if (!this.Collections.poderes) {
            this.Collections.poderes = new (this.App as any).Collection();
            this.storage.addCollection('poderes', this.Collections.poderes);
        }
    }

    /**
     * Mostrar vista de creación de cartera
     */
    crearCartera(): void {

        this.__initRepresentantes();
        this.__initPoderes();
        this.__initEmpresas();

        const view = new CarteraCrear({
            model: new Cartera(),
            isNew: true,
            App: this.App,
            api: this.api,
            logger: this.logger,
            storage: this.storage,
            region: this.region,
        });
        this.region.show(view);
        this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
        this.listenTo(view, 'add:cartera', this.__addCartera);
    }

    /**
     * Editar una cartera existente
     */
    async editaCartera(id: string): Promise<void> {
        this.__initRepresentantes();
        this.__initPoderes();
        this.__initEmpresas();

        if (!this.Collections.carteras || _.size(this.Collections.carteras) === 0) {
            try {
                if (!this.api) {
                    this.App?.trigger('alert:error', 'API no disponible');
                    return;
                }

                const response = await this.api.get('/cartera/listar');

                if (response?.success) {
                    this.__setCarteras((response as any).carteras);
                    const model = this.Collections.carteras.get(id);
                    if (model) {
                        const view = new CarteraCrear({
                            model: model, isNew: false,
                            App: this.App,
                            api: this.api,
                            logger: this.logger,
                            storage: this.storage,
                            region: this.region,
                        });
                        this.region.show(view);
                        this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
                        this.listenTo(view, 'add:cartera', this.__addCartera);
                    } else {
                        this.App?.trigger('alert:error', 'Cartera no encontrada');
                    }
                } else {
                    this.App?.trigger('alert:error', (response as any).msj || response.message || 'Error al cargar carteras');
                }
            } catch (error: any) {
                this.logger?.error('Error al cargar carteras:', error);
                this.App?.trigger('alert:error', error.message || 'Error de conexión al cargar carteras');
            }
        } else {
            const model = this.Collections.carteras.get(id);
            if (model) {
                const view = new CarteraCrear({
                    model: model, isNew: false,
                    App: this.App,
                    api: this.api,
                    logger: this.logger,
                    storage: this.storage,
                    region: this.region,
                });
                this.region.show(view);
                this.listenTo(view, 'search:empresa', this.__searchEmpresaValidation);
                this.listenTo(view, 'add:cartera', this.__addCartera);
            } else {
                this.App?.trigger('alert:error', 'Cartera no encontrada');
            }
        }
    }

    /**
     * Listar todas las carteras
     */
    async listaCartera(): Promise<void> {
        try {
            if (!this.api) {
                this.App?.trigger('alert:error', 'API no disponible');
                return;
            }

            const response = await this.api.get('/cartera/listar');

            if (response?.success) {
                this.__setCarteras((response as any).carteras);
                const view = new CarterasListar({ collection: this.Collections.carteras });
                this.region.show(view);
                this.listenTo(view, 'remove:cartera', this.__removeCartera);
            } else {
                this.App?.trigger('alert:error', (response as any).msj || response.message || 'Error al listar carteras');
            }
        } catch (error: any) {
            this.logger?.error('Error al listar carteras:', error);
            this.App?.trigger('alert:error', error.message || 'Error de conexión al listar carteras');
        }
    }

    /**
     * Mostrar detalle de una cartera
     */
    async mostrarDetalle(id: string): Promise<void> {
        this.__initEmpresas();
        this.__initCarteras();

        if (!this.Collections.carteras || _.size(this.Collections.carteras) === 0) {
            try {
                if (!this.api) {
                    this.App?.trigger('alert:error', 'API no disponible');
                    return;
                }

                const response = await this.api.get(`/cartera/detalle/${id}`);

                if (response?.success) {
                    const cartera = new Cartera((response as any).cartera);
                    const view = new CarteraDetalle({
                        model: cartera,
                        App: this.App,
                        api: this.api,
                        logger: this.logger,
                        storage: this.storage,
                        region: this.region,
                    });
                    this.region.show(view);
                } else {
                    this.App?.trigger('alert:error', (response as any).msj || response.message || 'Error al cargar detalle');
                }
            } catch (error: any) {
                this.logger?.error('Error al cargar detalle de cartera:', error);
                this.App?.trigger('alert:error', error.message || 'Error de conexión al cargar detalle');
            }
        } else {
            const cartera = this.Collections.carteras.get(id);
            if (cartera) {
                const view = new CarteraDetalle({ model: cartera });
                $(this.region.el).html(view.render().el);
            } else {
                this.App?.trigger('alert:error', 'Cartera no encontrada');
            }
        }
    }

    /**
     * Mostrar vista de cargue masivo
     */
    cargueMasivoCartera(): void {

        this.__initCarteras();
        const view = new CargueMasivoCartera();
        $(this.region.el).html(view.render().el);
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.App?.trigger('alert:error', 'Se ha producido un error en la aplicación');
        if (this.router) {
            this.router.navigate('listar', { trigger: true });
        }
    }

    /**
     * Validar empresa por NIT
     */
    private async __searchEmpresaValidation(transfer: CarteraTransfer): Promise<void> {
        const { nit, callback } = transfer;

        if (!nit || !callback) {
            this.App?.trigger('alert:error', 'Datos inválidos para búsqueda de empresa');
            return;
        }

        try {
            if (!this.api) {
                this.App?.trigger('alert:error', 'API no disponible');
                callback(false);
                return;
            }

            const response = await this.api.get(`/cartera/buscar_empresa/${nit}`);

            if (response.success === false) {
                this.App?.trigger('alert:error', (response as any).msj || response.message || 'Empresa no encontrada');
                callback(false);
            } else {
                callback(response);
            }
        } catch (error: any) {
            this.logger?.error('Error al buscar empresa:', error);
            this.App?.trigger('alert:error', error.message || 'Error de conexión al buscar empresa');
            callback(false);
        }
    }

    /**
     * Eliminar una cartera
     */
    private async __removeCartera(transfer: CarteraTransfer): Promise<void> {
        const { model, callback } = transfer;

        if (!model) {
            this.App?.trigger('alert:error', 'Modelo inválido para eliminar cartera');
            return;
        }

        if (!callback) {
            this.App?.trigger('alert:error', 'Callback inválido para eliminar cartera');
            return;
        }

        try {
            if (!this.api) {
                this.App?.trigger('alert:error', 'API no disponible');
                callback(false);
                return;
            }

            const response = await this.api.post(`/cartera/removeCartera/${model.get('id')}`, {
                nit: model.get('nit'),
                cedrep: model.get('cedrep'),
                id: model.get('id'),
            });

            if (response?.success) {
                this.__notifyPlataforma(model.get('nit'));
                callback(response);
            } else {
                this.App?.trigger('alert:error', (response as any).msj || response.message || 'Error al eliminar cartera');
                callback(false);
            }
        } catch (error: any) {
            this.logger?.error('Error al eliminar cartera:', error);
            this.App?.trigger('alert:error', error.message || 'Error de conexión al eliminar cartera');
            callback(false);
        }
    }

    /**
     * Inicializar colección de empresas usando BoxCollectionStorage
     */
    private __initEmpresas(): void {
        if (!this.Collections.empresas) {
            this.Collections.empresas = this.storage.getCollection('empresas')?.value || new (this.App as any).Collection();
            this.storage.addCollection('empresas', this.Collections.empresas);
        }
    }

    /**
     * Inicializar colección de carteras usando BoxCollectionStorage
     */
    private __initCarteras(): void {
        if (!this.Collections.carteras) {
            this.Collections.carteras = this.storage.getCollection('carteras')?.value || new CarterasCollection();
            this.storage.addCollection('carteras', this.Collections.carteras);
        }
    }

    /**
     * Inicializar colección de representantes usando BoxCollectionStorage
     */
    private __initRepresentantes(): void {
        if (!this.Collections.representantes) {
            this.Collections.representantes = this.storage.getCollection('representantes')?.value || new RepresentantesCollection();
            this.storage.addCollection('representantes', this.Collections.representantes);
        }
    }

    /**
     * Inicializar colección de poderes usando BoxCollectionStorage
     */
    private __initPoderes(): void {
        if (!this.Collections.poderes) {
            this.Collections.poderes = this.storage.getCollection('poderes')?.value || new (this.App as any).Collection();
            this.storage.addCollection('poderes', this.Collections.poderes);
        }
    }

    /**
     * Crear elemento de contenido
     */
    private __createContent(): HTMLElement {
        if (this.region?.el) {
            $(this.region.el).remove();
        }
        const el = document.createElement('div');
        el.setAttribute('id', this.region.id || 'content');
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(el);
        }
        if (typeof scroltop === 'function') {
            scroltop();
        }
        return el;
    }

    /**
     * Establecer empresas en la colección usando BoxCollectionStorage
     */
    private __setEmpresas(empresas: any[]): void {
        this.__initEmpresas();
        if (this.Collections.empresas && empresas) {
            this.Collections.empresas.add(empresas, { merge: true });
            // Persistir en localStorage
            this.storage.addCollection('empresas', this.Collections.empresas);
        }
    }

    /**
     * Establecer carteras en la colección usando BoxCollectionStorage
     */
    private __setCarteras(carteras: any[]): void {
        this.__initCarteras();
        if (this.Collections.carteras && carteras) {
            this.Collections.carteras.add(carteras, { merge: true });
            // Persistir en localStorage
            this.storage.addCollection('carteras', this.Collections.carteras);
        }
    }

    /**
     * Agregar una cartera a la colección usando BoxCollectionStorage
     */
    private __addCartera(cartera: any): Cartera {
        this.__initCarteras();
        if (!this.Collections.carteras) {
            return cartera instanceof Cartera ? cartera : new Cartera(cartera);
        }
        const carteraModel = cartera instanceof Cartera ? cartera : new Cartera(cartera);
        this.Collections.carteras.add(carteraModel, { merge: true });
        // Persistir en localStorage
        this.storage.addCollection('carteras', this.Collections.carteras);
        return carteraModel;
    }

    /**
     * Notificar a la plataforma sobre eliminación de cartera
     */
    private async __notifyPlataforma(nit: string): Promise<void> {
        if (!nit) {
            this.App?.trigger('alert:error', 'NIT requerido para notificación');
            return;
        }

        try {
            if (!this.api) {
                this.App?.trigger('alert:error', 'API no disponible');
                return;
            }

            const response = await this.api.post('/novedades/notyRemoveCartera', { nit });

            if (response?.success) {
                this.App?.trigger('alert:success', (response as any).msj || response.message || 'Notificación enviada exitosamente');
            } else {
                this.App?.trigger('alert:error', (response as any).msj || response.message || 'Error en notificación');
            }
        } catch (error: any) {
            this.logger?.error('Error al notificar plataforma:', error);
            this.App?.trigger('alert:error', error.message || 'Error de conexión al notificar plataforma');
        }
    }
}
