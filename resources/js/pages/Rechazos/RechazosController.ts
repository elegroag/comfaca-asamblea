import { Controller } from "@/common/Controller";
import { CommonDeps } from '@/types/CommonDeps';
import RechazoService from "./RechazoService";
import RechazoCrear from "./RechazoCrear";
import RechazosListar from "./RechazosListar";
import RechazosMasivo from "./RechazosMasivo";
import RechazoDetalle from "./RechazoDetalle";
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import Loading from '@/common/Loading';

interface RechazosControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class RechazosController extends Controller {
    private service: RechazoService;

    constructor(options: RechazosControllerOptions) {
        super(options);
        this.service = new RechazoService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todos los rechazos
     */
    async listarRechazos(): Promise<void> {
        try {
            // Obtener rechazos desde cache
            let rechazos = getCachedCollection('rechazos', null);
            if (rechazos === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllRechazos();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        rechazos = new (this.app as any).Collection(response.rechazos || []);

                        // Guardar en cache para uso futuro
                        cacheCollection('rechazos', rechazos, {
                            persistent: true, // Persistir en localStorage
                            ttl: 20 * 60 * 1000 // 20 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar rechazos');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar rechazos:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar rechazos');
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

            const view = new RechazosListar({
                collection: rechazos,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:rechazo', this.service.__removeRechazo.bind(this.service));
            this.listenTo(view, 'show:rechazo', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'edit:rechazo', this.editarRechazo.bind(this));
            this.listenTo(view, 'aprobar:rechazo', this.service.__aprobarRechazo.bind(this.service));
            this.listenTo(view, 'rechazar:rechazo', this.service.__rechazarRechazo.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar rechazos:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar rechazos');
        }
    }

    /**
     * Mostrar vista de creación de rechazo
     */
    showCreate(): void {
        const view = new RechazoCrear({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:rechazo', this.service.__saveRechazo.bind(this.service));
    }

    /**
     * Mostrar vista de cargue masivo
     */
    showMasivo(): void {
        const view = new RechazosMasivo({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'file:upload', this.service.__cargarMasivo.bind(this.service));
        this.listenTo(view, 'download:plantilla', this.service.__descargarPlantilla.bind(this.service));
    }

    /**
     * Mostrar detalle de un rechazo
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            // Obtener rechazos desde cache
            let rechazos = getCachedCollection('rechazos', null);
            if (rechazos === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllRechazos();
                if (response && response.success === true) {
                    rechazos = new (this.app as any).Collection(response.rechazos || []);
                    cacheCollection('rechazos', rechazos, {
                        persistent: true,
                        ttl: 20 * 60 * 1000
                    });
                }
            }

            const model = rechazos.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Rechazo no encontrado');
                return;
            }

            const view = new RechazoDetalle({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
                router: this.router
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar rechazo');
        }
    }

    /**
     * Editar un rechazo
     */
    async editarRechazo(id: string): Promise<void> {
        try {
            // Obtener rechazos desde cache
            let rechazos = getCachedCollection('rechazos', null);
            if (rechazos === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllRechazos();
                if (response && response.success === true) {
                    rechazos = new (this.app as any).Collection(response.rechazos || []);
                    cacheCollection('rechazos', rechazos, {
                        persistent: true,
                        ttl: 20 * 60 * 1000
                    });
                }
            }

            const model = rechazos.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Rechazo no encontrado');
                return;
            }

            const view = new RechazoCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:rechazo', this.service.__saveRechazo.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar rechazo:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar rechazo');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Rechazos');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
