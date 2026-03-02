import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import ConsensoService from './ConsensoService';
import ConsensosListar from "@/componentes/consensos/views/ConsensosListar";
import ConsensoCrear from "@/componentes/consensos/views/ConsensoCrear";
import ConsensoDetalle from "@/componentes/consensos/views/ConsensoDetalle";
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import ConsensosCollection from '@/collections/ConsensosCollection';
import Loading from '@/common/Loading';

interface ConsensoControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class ConsensoController extends Controller {
    private service: ConsensoService;

    constructor(options: ConsensoControllerOptions) {
        super(options);
        this.service = new ConsensoService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todos los consensos
     */
    async listarConsensos(): Promise<void> {
        try {
            // Obtener consensos desde cache
            let consensos = getCachedCollection('consensos', ConsensosCollection);
            if (consensos === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllConsensos();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        consensos = new ConsensosCollection();
                        consensos.add(response.consensos || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('consensos', consensos, {
                            persistent: true, // Persistir en localStorage
                            ttl: 40 * 60 * 1000 // 40 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar consensos');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar consensos:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar consensos');
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

            const view = new ConsensosListar({
                collection: consensos,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:consenso', this.service.__removeConsenso.bind(this.service));
            this.listenTo(view, 'show:consenso', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'edit:consenso', this.editarConsenso.bind(this));
            this.listenTo(view, 'activar:consenso', this.service.__activarConsenso.bind(this.service));
            this.listenTo(view, 'inactivar:consenso', this.service.__inactivarConsenso.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar consensos:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar consensos');
        }
    }

    /**
     * Crear consenso
     */
    crearConsenso(): void {
        const view = new ConsensoCrear({
            model: {
                id: null,
                titulo: '',
                descripcion: '',
                fecha: '',
                estado: 'inactivo'
            },
            isNew: true,
            app: this.app || undefined,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:consenso', this.service.__saveConsenso.bind(this.service));
    }

    /**
     * Editar consenso
     */
    async editarConsenso(id: string): Promise<void> {
        try {
            // Obtener consensos desde cache
            let consensos = getCachedCollection('consensos', ConsensosCollection);
            if (consensos === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllConsensos();
                if (response && response.success === true) {
                    consensos = new ConsensosCollection();
                    consensos.add(response.consensos || [], { merge: true });
                    cacheCollection('consensos', consensos, {
                        persistent: true,
                        ttl: 40 * 60 * 1000
                    });
                }
            }

            const model = consensos.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Consenso no encontrado');
                return;
            }

            const view = new ConsensoCrear({
                model: model,
                isNew: false,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:consenso', this.service.__saveConsenso.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar consenso:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar consenso');
        }
    }

    /**
     * Mostrar detalle de consenso
     */
    async consensoDetalle(id: string): Promise<void> {
        try {
            // Obtener consensos desde cache
            let consensos = getCachedCollection('consensos', ConsensosCollection);
            if (consensos === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllConsensos();
                if (response && response.success === true) {
                    consensos = new ConsensosCollection();
                    consensos.add(response.consensos || [], { merge: true });
                    cacheCollection('consensos', consensos, {
                        persistent: true,
                        ttl: 40 * 60 * 1000
                    });
                }
            }

            const model = consensos.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Consenso no encontrado');
                return;
            }

            const view = new ConsensoDetalle({
                model: model,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar consenso');
        }
    }

    /**
     * Mostrar detalle de consenso (alias)
     */
    async mostrarDetalle(id: string): Promise<void> {
        await this.consensoDetalle(id);
    }

    /**
     * Formulario para crear consenso (alias para router)
     */
    formCrearConsenso(): void {
        this.crearConsenso();
    }

    /**
     * Formulario para editar consenso (alias para router)
     */
    async formEditConsenso(id: string): Promise<void> {
        await this.editarConsenso(id);
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Consensos');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
