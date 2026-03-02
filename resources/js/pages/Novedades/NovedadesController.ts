import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import NovedadesService from './NovedadesService';
import NovedadesListar from '@/componentes/novedades/views/NovedadesListar';
import NovedadDetalle from '@/componentes/novedades/views/NovedadDetalle';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import NovedadesCollection from '@/collections/NovedadesCollection';
import Loading from '@/common/Loading';

interface NovedadesControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class NovedadesController extends Controller {
    private service: NovedadesService;

    constructor(options: NovedadesControllerOptions) {
        super(options);
        this.service = new NovedadesService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todas las novedades
     */
    async listarNovedades(): Promise<void> {
        try {
            // Obtener novedades desde cache
            let novedades = getCachedCollection('novedades', NovedadesCollection);
            if (novedades === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllNovedades();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        novedades = new NovedadesCollection(response.novedades || []);

                        // Guardar en cache para uso futuro
                        cacheCollection('novedades', novedades, {
                            persistent: true, // Persistir en localStorage
                            ttl: 25 * 60 * 1000 // 25 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar novedades');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar novedades:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar novedades');
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

            const view = new NovedadesListar({
                collection: novedades,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:novedad', this.service.__removeNovedad.bind(this.service));
            this.listenTo(view, 'show:novedad', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'edit:novedad', this.editarNovedad.bind(this));
            this.listenTo(view, 'marcar:leida', this.service.__marcarLeida.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar novedades:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar novedades');
        }
    }

    /**
     * Crear novedad
     */
    crearNovedad(): void {
        // Implementación básica temporal
        this.region.show('<div class="p-4">Crear novedad (vista temporal)</div>');
    }

    /**
     * Mostrar detalle de novedad
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            // Obtener novedades desde cache
            let novedades = getCachedCollection('novedades', NovedadesCollection);
            if (novedades === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllNovedades();
                if (response && response.success === true) {
                    novedades = new NovedadesCollection(response.novedades || []);
                    cacheCollection('novedades', novedades, {
                        persistent: true,
                        ttl: 25 * 60 * 1000
                    });
                }
            }

            const model = novedades.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Novedad no encontrada');
                return;
            }

            const view = new NovedadDetalle({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar novedad');
        }
    }

    /**
     * Editar novedad
     */
    async editarNovedad(id: string): Promise<void> {
        try {
            // Obtener novedades desde cache
            let novedades = getCachedCollection('novedades', NovedadesCollection);
            if (novedades === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllNovedades();
                if (response && response.success === true) {
                    novedades = new NovedadesCollection(response.novedades || []);
                    cacheCollection('novedades', novedades, {
                        persistent: true,
                        ttl: 25 * 60 * 1000
                    });
                }
            }

            const model = novedades.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Novedad no encontrada');
                return;
            }

            // Implementación básica temporal
            this.region.show(`<div class="p-4">Editar novedad: ${id} (vista temporal)</div>`);

        } catch (error: any) {
            this.logger?.error('Error al editar novedad:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar novedad');
        }
    }

    /**
     * Detalle de novedad (alias para router)
     */
    detalleNovedad(id: string): void {
        this.mostrarDetalle(id);
    }

    /**
     * Listar novedades no leídas
     */
    async listarNoLeidas(): Promise<void> {
        try {
            const noLeidas = await this.service.__getNoLeidas();

            // Crear una vista temporal para mostrar las no leídas
            const view = new NovedadesListar({
                collection: new NovedadesCollection(noLeidas),
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:novedad', this.service.__removeNovedad.bind(this.service));
            this.listenTo(view, 'show:novedad', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'edit:novedad', this.editarNovedad.bind(this));
            this.listenTo(view, 'marcar:leida', this.service.__marcarLeida.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar novedades no leídas:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar novedades');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Novedades');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
