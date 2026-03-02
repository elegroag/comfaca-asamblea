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
    private service: RepresentanteService;

    constructor(options: RepresentanteControllerOptions) {
        super(options);
        this.service = new RepresentanteService({
            api: options.api,
            logger: options.logger,
            app: options.app
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

                    const response = await this.service.findAllRepresentantes();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        representantes = new RepresentantesCollection(response.representantes || []);

                        // Guardar en cache para uso futuro
                        cacheCollection('representantes', representantes, {
                            persistent: true, // Persistir en localStorage
                            ttl: 30 * 60 * 1000 // 30 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar representantes');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar representantes:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar representantes');
                    return;
                } finally {
                    if (Loading) Loading.hide();
                }
            } else {
                if (Loading) Loading.show();
                setTimeout(() => {
                    if (Loading) Loading.hide();
                }, 300);
            }

            const view = new RepresentantesListar({
                collection: representantes,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:representante', this.service.__removeRepresentante.bind(this.service));
            this.listenTo(view, 'show:representante', this.mostrarRepresentante.bind(this));
            this.listenTo(view, 'edit:representante', this.editarRepresentante.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar representantes:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar representantes');
        }
    }

    /**
     * Crear representante
     */
    crearRepresentante(): void {
        const view = new RepresentanteCrear({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
            isNew: true,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:representante', this.service.__saveRepresentante.bind(this.service));
    }

    /**
     * Mostrar detalle de representante
     */
    async mostrarRepresentante(id: string): Promise<void> {
        try {
            // Obtener representantes desde cache
            let representantes = getCachedCollection('representantes', RepresentantesCollection);
            if (representantes === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllRepresentantes();
                if (response && response.success === true) {
                    representantes = new RepresentantesCollection(response.representantes || []);
                    cacheCollection('representantes', representantes, {
                        persistent: true,
                        ttl: 30 * 60 * 1000
                    });
                }
            }

            const model = representantes.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Representante no encontrado');
                return;
            }

            const view = new RepresentanteMostrar({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar representante:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar representante');
        }
    }

    /**
     * Editar representante
     */
    async editarRepresentante(id: string): Promise<void> {
        try {
            // Obtener representantes desde cache
            let representantes = getCachedCollection('representantes', RepresentantesCollection);
            if (representantes === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllRepresentantes();
                if (response && response.success === true) {
                    representantes = new RepresentantesCollection(response.representantes || []);
                    cacheCollection('representantes', representantes, {
                        persistent: true,
                        ttl: 30 * 60 * 1000
                    });
                }
            }

            const model = representantes.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Representante no encontrado');
                return;
            }

            const view = new RepresentanteCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:representante', this.service.__saveRepresentante.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar representante:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar representante');
        }
    }

    /**
     * Editar representante por cédula
     */
    async editaRepresentante(cedula: string): Promise<void> {
        try {
            const response = await this.service.findByRepresentante(cedula);
            if (response && response.success) {
                this.editarRepresentante(response.representante.id);
            } else {
                this.app?.trigger('alert:error', 'Representante no encontrado');
            }
        } catch (error: any) {
            this.logger?.error('Error al editar representante por cédula:', error);
            this.app?.trigger('alert:error', error.message || 'Error al buscar representante');
        }
    }

    /**
     * Cargar archivo masivo
     */
    async cargarMasivo(): Promise<void> {
        try {
            // Implementación básica temporal
            this.region.show('<div class="p-4">Cargar archivo masivo (vista temporal)</div>');
        } catch (error: any) {
            this.logger?.error('Error al cargar archivo masivo:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar archivo');
        }
    }

    /**
     * Buscar representantes
     */
    async buscarRepresentantes(criterio: string): Promise<void> {
        try {
            if (Loading) Loading.show();

            const representantes = await this.service.__buscarRepresentantes(criterio);

            const view = new RepresentantesListar({
                collection: new RepresentantesCollection(representantes),
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:representante', this.service.__removeRepresentante.bind(this.service));
            this.listenTo(view, 'show:representante', this.mostrarRepresentante.bind(this));
            this.listenTo(view, 'edit:representante', this.editarRepresentante.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al buscar representantes:', error);
            this.app?.trigger('alert:error', error.message || 'Error al buscar representantes');
        } finally {
            if (Loading) Loading.hide();
        }
    }

    /**
     * Exportar lista
     */
    async exportarLista(): Promise<void> {
        try {
            await this.service.__exportLista();
        } catch (error: any) {
            this.logger?.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', error.message || 'Error al exportar lista');
        }
    }

    /**
     * Exportar informe
     */
    async exportarInforme(): Promise<void> {
        try {
            await this.service.__exportInforme();
        } catch (error: any) {
            this.logger?.error('Error al exportar informe:', error);
            this.app?.trigger('alert:error', error.message || 'Error al exportar informe');
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
