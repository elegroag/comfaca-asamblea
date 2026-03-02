import { Controller } from '@/common/Controller';
import PoderesListarView from '@/componentes/poderes/views/PoderesListarView';
import PoderCrear from '@/componentes/poderes/views/PoderCrear';
import PoderBuscar from '@/componentes/poderes/views/PoderBuscar';
import RechazaPoder from '@/componentes/poderes/views/RechazaPoder';
import PoderMasivo from '@/componentes/poderes/views/PoderMasivo';
import PoderDetalle from '@/componentes/poderes/views/PoderDetalle';
import PoderService from './PoderService';
import PoderesCollection from '@/collections/Poderes';
import Poder from '@/models/Poder';
import { cacheCollection, cacheModel } from '@/componentes/CacheManager';

export default class PoderesController extends Controller {
    poderService: PoderService;
    private poderesCollection: PoderesCollection;

    constructor(options: any) {
        super(options);

        this.poderService = new PoderService({
            api: this.api,
            app: this.app!,
            logger: this.logger!,
        });

        // Inicializar colección de poderes
        this.poderesCollection = new PoderesCollection();
    }

    /**
     * Listar todos los poderes
     */
    async listar(): Promise<void> {
        try {
            // Obtener datos desde el servicio
            const response = await this.poderService.findAllPoderes();

            if (response?.success) {
                // Actualizar colección con los datos del servidor
                this.poderesCollection.reset();
                this.poderesCollection.add(response.data || []);

                // Guardar en cache para uso futuro
                cacheCollection('poderes', this.poderesCollection, {
                    persistent: false, // Solo en memoria para datos transaccionales
                    ttl: 5 * 60 * 1000 // 5 minutos
                });
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al cargar poderes' });
                return;
            }

            const view = new PoderesListarView({
                collection: this.poderesCollection,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el controller
            this.listenTo(view, 'remove:poder', this.handleRemovePoder.bind(this));
            this.listenTo(view, 'edit:poder', this.editarPoder.bind(this));
            this.listenTo(view, 'show:poder', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'activar:poder', this.handleActivarPoder.bind(this));
            this.listenTo(view, 'inactivar:poder', this.handleInactivarPoder.bind(this));
            this.listenTo(view, 'export:lista', this.handleExportLista.bind(this));
            this.listenTo(view, 'file:upload', this.handleUploadMasivo.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar poderes:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar poderes');
        }
    }

    /**
     * Manejar eliminación de poder
     */
    async handleRemovePoder(options: { model: Poder, removeFromCollection?: boolean }): Promise<void> {
        const { model, removeFromCollection = true } = options;

        try {
            const response = await this.poderService.removePoder(model.id);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Poder eliminado exitosamente' });

                if (removeFromCollection) {
                    this.poderesCollection.remove(model);
                }
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al eliminar poder' });
            }
        } catch (error: any) {
            this.logger?.error('Error al eliminar poder:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar activación de poder
     */
    async handleActivarPoder(model: Poder): Promise<void> {
        try {
            const response = await this.poderService.activarPoder(model.id);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Poder activado exitosamente' });
                model.set('estado', 'activo');
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al activar poder' });
            }
        } catch (error: any) {
            this.logger?.error('Error al activar poder:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar inactivación de poder
     */
    async handleInactivarPoder(model: Poder): Promise<void> {
        try {
            const response = await this.poderService.inactivarPoder(model.id);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Poder inactivado exitosamente' });
                model.set('estado', 'inactivo');
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al inactivar poder' });
            }
        } catch (error: any) {
            this.logger?.error('Error al inactivar poder:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
        }
    }

    /**
     * Manejar exportación de lista
     */
    async handleExportLista(): Promise<void> {
        try {
            await this.poderService.exportLista();
        } catch (error: any) {
            this.logger?.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', error.message || 'Error al exportar');
        }
    }

    /**
     * Manejar cargue masivo
     */
    async handleUploadMasivo(options: { formData: FormData, callback: (success: boolean, data?: any) => void }): Promise<void> {
        try {
            await this.poderService.uploadMasivo(options);

            // Recargar lista después del cargue exitoso
            this.listar();
        } catch (error: any) {
            this.logger?.error('Error en cargue masivo:', error);
            this.app?.trigger('alert:error', error.message || 'Error en cargue masivo');
        }
    }

    /**
     * Mostrar vista de creación de poder
     */
    crearPoder(): void {
        const model = new Poder({
            id: null,
            poderdante_nit: '',
            poderdante_cedula: '',
            poderdante_razsoc: '',
            poderdante_repleg: '',
            apoderado_nit: '',
            apoderado_cedula: '',
            apoderado_razsoc: '',
            apoderado_repleg: '',
            fecha: new Date().toISOString().split('T')[0],
            radicado: '',
            estado: 'activo'
        });

        const view = new PoderCrear({
            model: model,
            isNew: true,
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el controller
        this.listenTo(view, 'save:poder', this.handleSavePoder.bind(this));
    }

    /**
     * Manejar guardado de poder
     */
    async handleSavePoder(options: { model: Poder, callback: (success: boolean, data?: any) => void }): Promise<void> {
        const { model, callback } = options;

        try {
            const response = await this.poderService.savePoder(model);

            if (response?.success) {
                this.app?.trigger('alert:success', { message: response.message || 'Poder guardado exitosamente' });

                // Agregar a la colección si es nuevo
                if (!model.id && response.data) {
                    this.poderesCollection.add(response.data);
                }

                cacheCollection('poderes', this.poderesCollection, {
                    persistent: false,
                    ttl: 5 * 60 * 1000
                });

                callback(true, response.data);
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'Error al guardar poder' });
                callback(false);
            }
        } catch (error: any) {
            this.logger?.error('Error al guardar poder:', error);
            this.app?.trigger('alert:error', error.message || 'Error de conexión');
            callback(false);
        }
    }

    /**
     * Editar un poder existente
     */
    async editarPoder(id: string): Promise<void> {
        try {
            // Buscar poder por ID
            const response = await this.poderService.findPoder(id);

            if (!response?.success) {
                this.app?.trigger('alert:error', 'Poder no encontrado');
                return;
            }

            const model = new Poder(response.data);

            cacheModel('poder-model', model, {
                persistent: false,
                ttl: 5 * 60 * 1000
            });

            const view = new PoderCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el controller
            this.listenTo(view, 'save:poder', this.handleSavePoder.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al editar poder:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar poder');
        }
    }

    /**
     * Mostrar detalle de un poder
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            const result = await this.poderService.findPoderCompleto(id);

            if (!result) {
                this.app?.trigger('alert:error', 'Poder no encontrado');
                return;
            }

            const { apoderado, poderdante, poder, criteriosRechazos } = result;

            cacheModel('poder-model', poder, {
                persistent: false,
                ttl: 5 * 60 * 1000
            });

            const view = new PoderDetalle({
                model: poder,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
                collection: [
                    {
                        apoderado,
                        poderdante,
                        criteriosRechazos,
                    }
                ]

            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar poder');
        }
    }

    /**
     * Buscar poder
     */
    buscar(): void {
        const view = new PoderBuscar({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);
    }

    /**
     * Crear rechazo de poder
     */
    async crearRechazo(): Promise<void> {
        try {
            const criteriosRechazos = await this.poderService.findCriteriosRechazos();

            if (!criteriosRechazos) {
                this.app?.trigger('alert:error', 'No se pudieron cargar los criterios de rechazo');
                return;
            }

            const view = new RechazaPoder({
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
                collection: criteriosRechazos
            });

            this.region.show(view);
        } catch (error) {
            this.logger?.error('Error al crear rechazo:', error);
            this.app?.trigger('alert:error', 'Error al crear rechazo');
        }
    }

    /**
     * Cargue masivo de poderes
     */
    cargueMasivo(): void {
        const view = new PoderMasivo({
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
        this.app?.trigger('alert:error', 'Error en la aplicación de Poderes');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
