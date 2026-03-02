import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import RepresentanteService from './RepresentanteService';
import RepresentantesListar from '@/componentes/representantes/views/RepresentanteListar';
import RepresentanteCrear from '@/componentes/representantes/views/RepresentanteCrear';
import RepresentanteMostrar from '@/componentes/representantes/views/RepresentanteMostrar';
import RepresentantesCollection from '@/collections/RepresentantesCollection';
import Representante from '@/models/Representante';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import Loading from '@/common/Loading';

interface RepresentanteControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class RepresentanteController extends Controller {
    public representanteService: RepresentanteService;

    constructor(options: RepresentanteControllerOptions) {
        super(options);
        this.representanteService = new RepresentanteService({
            api: this.api,
            logger: this.logger,
            app: this.app,
            RepresentanteModel: Representante
        });
    }

    /**
     * Listar todos los representantes
     */
    async listarRepresentantes(): Promise<void> {
        try {
            // Obtener representantes desde cache
            let representantes = getCachedCollection('representantes', RepresentantesCollection);

            if (representantes === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.representanteService.findAllRepresentantes();

                    if (response && response.success === true) {
                        // Crear collection y agregar datos
                        representantes = new RepresentantesCollection();
                        representantes.add((response as any).representantes || [], { merge: true });

                        // Guardar en cache
                        cacheCollection('representantes', representantes, {
                            persistent: true,
                            ttl: 60 * 60 * 1000
                        });
                    } else {
                        this.app?.trigger('alert:error', { message: response.message || 'Error al obtener representantes' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar representantes:', error);
                    this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al listar representantes' });
                } finally {
                    if (Loading) Loading.hide();
                }
            }

            // Mostrar vista con la collection
            const view = new RepresentantesListar({
                collection: representantes,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el controller
            this.listenTo(view, 'remove:representante', this.handleRemoveRepresentante.bind(this));
            this.listenTo(view, 'show:representante', this.mostrarRepresentante.bind(this));
            this.listenTo(view, 'edit:representante', this.editarRepresentante.bind(this));

        } catch (err: any) {
            this.logger.error('Error al listar representantes:', err);
            this.app?.trigger('alert:error', { message: err.message || 'Error al cargar representantes' });
        }
    }

    /**
     * Crear representante
     */
    crearRepresentante(): void {
        const controller = this.startController(RepresentanteCrear) as RepresentanteCrear;
        controller.crearRepresentante();
    }

    /**
     * Mostrar representante
     */
    async mostrarRepresentante(id: string): Promise<void> {
        try {
            const controller = this.startController(RepresentanteMostrar) as RepresentanteMostrar;

            // Obtener representantes desde cache
            let representantes = getCachedCollection('representantes', RepresentantesCollection);

            if (representantes === null) {
                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.representanteService.findByRepresentante(id);

                    if (response && response.success === true) {
                        representantes = new RepresentantesCollection();
                        representantes.add(response.representante, { merge: true });

                        cacheCollection('representantes', representantes, {
                            persistent: true,
                            ttl: 60 * 60 * 1000
                        });

                        const model = representantes.get(id);
                        controller.mostrarRepresentante(model);
                    } else {
                        this.app?.trigger('alert:error', { message: response.message || 'Error al obtener detalles del representante' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al mostrar representante:', error);
                    this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al mostrar representante' });
                }
            } else {
                const model = representantes.get(id);
                controller.mostrarRepresentante(model);
            }
        } catch (err: any) {
            this.logger.error('Error al mostrar representante:', err);
            this.app?.trigger('alert:error', { message: err.message || 'Error al cargar representante' });
        }
    }

    /**
     * Editar representante
     */
    async editarRepresentante(id: string): Promise<void> {
        try {
            const controller = this.startController(RepresentanteCrear) as RepresentanteCrear;

            // Obtener representantes desde cache
            let representantes = getCachedCollection('representantes', RepresentantesCollection);

            if (representantes === null) {
                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.representanteService.findByRepresentante(id);

                    if (response && response.success === true) {
                        representantes = new RepresentantesCollection();
                        representantes.add(response.representante, { merge: true });

                        cacheCollection('representantes', representantes, {
                            persistent: true,
                            ttl: 60 * 60 * 1000
                        });

                        const model = representantes.get(id);
                        controller.editarRepresentante(model);
                    } else {
                        this.app?.trigger('alert:error', { message: response.message || 'Error al obtener representante' });
                    }
                } catch (error: any) {
                    this.logger.error('Error al editar representante:', error);
                    this.app?.trigger('alert:error', { message: error.message || 'Error de conexión al editar representante' });
                }
            } else {
                const model = representantes.get(id);
                controller.editarRepresentante(model);
            }
        } catch (err: any) {
            this.logger.error('Error al editar representante:', err);
            this.app?.trigger('alert:error', { message: err.message || 'Error al cargar representante' });
        }
    }

    /**
     * Editar representante (alias para router)
     */
    editaRepresentante(cedula: string): void {
        this.editarRepresentante(cedula);
    }

    /**
     * Cargar representantes masivamente
     */
    cargarMasivo(): void {
        // Implementar si se necesita vista de cargue masivo
        this.app?.trigger('alert:info', { message: 'Función de cargue masivo en desarrollo' });
    }

    /**
     * Buscar representantes por criterio
     */
    async buscarRepresentantes(criterio: string): Promise<void> {
        try {
            if (Loading) Loading.show();

            const response = await this.representanteService.buscarRepresentantes(criterio);

            if (response && response.success === true) {
                // Crear collection temporal con resultados
                const representantes = new RepresentantesCollection();
                representantes.add((response as any).representantes || [], { merge: true });

                // Mostrar vista con resultados
                const view = new RepresentantesListar({
                    collection: representantes,
                    app: this.app,
                    api: this.api,
                    logger: this.logger,
                    region: this.region,
                });

                this.region.show(view);

                // Conectar eventos
                this.listenTo(view, 'remove:representante', this.handleRemoveRepresentante.bind(this));
                this.listenTo(view, 'show:representante', this.mostrarRepresentante.bind(this));
                this.listenTo(view, 'edit:representante', this.editarRepresentante.bind(this));
            } else {
                this.app?.trigger('alert:error', { message: response?.message || 'No se encontraron representantes' });
            }
        } catch (error: any) {
            this.logger.error('Error al buscar representantes:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error al buscar representantes' });
        } finally {
            if (Loading) Loading.hide();
        }
    }

    /**
     * Manejar eliminación de representante desde la collection
     */
    private handleRemoveRepresentante(data: any): void {
        if (data.removeFromCollection && data.model) {
            // Obtener representantes desde cache y eliminar el modelo
            const representantes = getCachedCollection('representantes', RepresentantesCollection);
            if (representantes) {
                representantes.remove(data.model);

                // Actualizar cache
                cacheCollection('representantes', representantes, {
                    persistent: true,
                    ttl: 60 * 60 * 1000
                });
            }
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Representantes');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
