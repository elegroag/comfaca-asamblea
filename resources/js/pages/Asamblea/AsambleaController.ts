import { Controller } from '@/common/Controller';
import AsambleaDetalle from '@/componentes/asamblea/views/AsambleaDetalle';
import AsambleaListar from '@/componentes/asamblea/views/AsambleaListar';
import AsambleaActiva from '@/componentes/asamblea/views/AsambleaActiva';
import { CommonDeps } from '@/types/CommonDeps';
import AsambleaService from './AsambleaService';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import AsambleasCollection from '@/collections/AsambleasCollection';
import Loading from '@/common/Loading';

export default class AsambleaController extends Controller {
    private service: AsambleaService;

    constructor(options: CommonDeps) {
        super(options);
        this.service = new AsambleaService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Mostrar asamblea activa
     */
    async asambleaActiva(): Promise<void> {
        try {
            // Obtener asambleas desde cache
            let asambleas = getCachedCollection('asambleas', AsambleasCollection);
            if (asambleas === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllAsambleas();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        asambleas = new AsambleasCollection();
                        asambleas.add(response.asambleas || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('asambleas', asambleas, {
                            persistent: true, // Persistir en localStorage
                            ttl: 45 * 60 * 1000 // 45 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar asambleas');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al mostrar asamblea activa:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar asambleas');
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

            const view = new AsambleaActiva({
                collection: asambleas,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'activar:asamblea', this.service.__activarAsamblea.bind(this.service));
            this.listenTo(view, 'show:detalle', this.asambleaDetalle.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al mostrar asamblea activa:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar asamblea activa');
        }
    }

    /**
     * Listar todas las asambleas
     */
    async listarAsambleas(): Promise<void> {
        try {
            // Obtener asambleas desde cache
            let asambleas = getCachedCollection('asambleas', AsambleasCollection);
            if (asambleas === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllAsambleas();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        asambleas = new AsambleasCollection();
                        asambleas.add(response.asambleas || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('asambleas', asambleas, {
                            persistent: true, // Persistir en localStorage
                            ttl: 45 * 60 * 1000 // 45 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar asambleas');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar asambleas:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar asambleas');
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

            const view = new AsambleaListar({
                collection: asambleas,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:asamblea', this.service.__removeAsamblea.bind(this.service));
            this.listenTo(view, 'edit:asamblea', this.editarAsamblea.bind(this));
            this.listenTo(view, 'show:detalle', this.asambleaDetalle.bind(this));
            this.listenTo(view, 'export:lista', this.service.__exportLista.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar asambleas:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar asambleas');
        }
    }

    /**
     * Mostrar detalle de asamblea
     */
    async asambleaDetalle(id: string): Promise<void> {
        try {
            // Obtener asambleas desde cache
            let asambleas = getCachedCollection('asambleas', AsambleasCollection);
            if (asambleas === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllAsambleas();
                if (response && response.success === true) {
                    asambleas = new AsambleasCollection();
                    asambleas.add(response.asambleas || [], { merge: true });
                    cacheCollection('asambleas', asambleas, {
                        persistent: true,
                        ttl: 45 * 60 * 1000
                    });
                }
            }

            const model = asambleas.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Asamblea no encontrada');
                return;
            }

            const view = new AsambleaDetalle({
                model: model,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'save:asamblea', this.service.__saveAsamblea.bind(this.service));
            this.listenTo(view, 'activar:asamblea', this.service.__activarAsamblea.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar asamblea');
        }
    }

    /**
     * Editar asamblea (redirigir a detalle)
     */
    async editarAsamblea(id: string): Promise<void> {
        await this.asambleaDetalle(id);
    }

    /**
     * Crear nueva asamblea
     */
    crearAsamblea(): void {
        // Crear modelo vacío para nueva asamblea
        const nuevaAsamblea = {
            id: null,
            nombre: '',
            descripcion: '',
            fecha: new Date().toISOString().split('T')[0],
            estado: 'inactiva'
        };

        const view = new AsambleaDetalle({
            model: nuevaAsamblea,
            isNew: true,
            app: this.app || undefined,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'save:asamblea', this.service.__saveAsamblea.bind(this.service));
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Asamblea');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
