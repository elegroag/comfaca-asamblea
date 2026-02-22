import { Controller } from "@/common/Controller";
import { CommonDeps } from '@/types/CommonDeps';
import RechazoService from "./RechazoService";
import RechazoCrear from "./RechazoCrear";
import RechazosListar from "./RechazosListar";
import RechazosMasivo from "./RechazosMasivo";
import RechazoDetalle from "./RechazoDetalle";
import ApiService from "@/services/ApiService";
import { AppInstance } from "@/types/types";

interface RechazosControllerOptions extends CommonDeps {
    [key: string]: any;
    app: AppInstance;
    api: ApiService;
    logger: any;
    region: any;
}

export default class RechazosController extends Controller {
    private service: RechazoService;

    constructor(options: RechazosControllerOptions) {
        super(options);
        this.app = options.app;
        _.extend(this, options);

        this.service = new RechazoService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
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
     * Listar todos los rechazos
     */
    async showList(): Promise<void> {
        try {
            await this.service.__findAll();

            const view = new RechazosListar({
                collection: (this.service as any).collections.rechazos,
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

        } catch (error: any) {
            this.logger?.error('Error al listar rechazos:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar rechazos');
        }
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
        this.listenTo(view, 'file:upload', this.service.__uploadMasivo.bind(this.service));
    }

    /**
     * Mostrar detalle de un rechazo
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            // Asegurarse de que los rechazos estén cargados
            await this.service.__findAll();

            const rechazos = (this.service as any).collections.rechazos;
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
            // Asegurarse de que los rechazos estén cargados
            await this.service.__findAll();

            const rechazos = (this.service as any).collections.rechazos;
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
