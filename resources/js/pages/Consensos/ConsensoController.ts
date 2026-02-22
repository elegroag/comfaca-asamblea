import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import ConsensoService from './ConsensoService';
import ConsensosListar from "@/componentes/consensos/views/ConsensosListar";
import ConsensoCrear from "@/componentes/consensos/views/ConsensoCrear";
import ConsensoDetalle from "@/componentes/consensos/views/ConsensoDetalle";

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
            await this.service.__findAll();

            const view = new ConsensosListar({
                collection: (this.service as any).collections.consensos,
                App: this.App,
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
            this.App?.trigger('alert:error', error.message || 'Error al cargar consensos');
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
            App: this.App,
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
            // Asegurarse de que los consensos estén cargados
            await this.service.__findAll();

            const consensos = (this.service as any).collections.consensos;
            const model = consensos.get(id);

            if (!model) {
                this.App?.trigger('alert:error', 'Consenso no encontrado');
                return;
            }

            const view = new ConsensoCrear({
                model: model,
                isNew: false,
                App: this.App,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:consenso', this.service.__saveConsenso.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar consenso:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar consenso');
        }
    }

    /**
     * Mostrar detalle de consenso
     */
    async consensoDetalle(id: string): Promise<void> {
        try {
            // Asegurarse de que los consensos estén cargados
            await this.service.__findAll();

            const consensos = (this.service as any).collections.consensos;
            const model = consensos.get(id);

            if (!model) {
                this.App?.trigger('alert:error', 'Consenso no encontrado');
                return;
            }

            const view = new ConsensoDetalle({
                model: model,
                App: this.App,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar consenso');
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
        this.App?.trigger('alert:error', 'Error en la aplicación de Consensos');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
