import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import InterventorService from './InterventorService';
import InterventorMostrarView from '@/componentes/interventores/views/InterventorMostrarView';
import InterventorCrearView from '@/componentes/interventores/views/InterventorCrearView';
import InterventoresListView from '@/componentes/interventores/views/InterventoresListView';

interface InterventorControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class InterventorController extends Controller {
    private service: InterventorService;

    constructor(options: InterventorControllerOptions) {
        super(options);
        this.service = new InterventorService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todos los interventores
     */
    async listarInterventores(): Promise<void> {
        try {
            await this.service.__findAll();

            const view = new InterventoresListView({
                collection: (this.service as any).collections.interventores,
                App: this.App,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:interventor', this.service.__removeInterventor.bind(this.service));
            this.listenTo(view, 'show:interventor', this.mostrarInterventor.bind(this));
            this.listenTo(view, 'edit:interventor', this.editarInterventor.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar interventores:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar interventores');
        }
    }

    /**
     * Crear interventor
     */
    crearInterventor(): void {
        const view = new InterventorCrearView({
            model: {
                id: null,
                nombre: '',
                identificacion: '',
                email: '',
                telefono: '',
                estado: 'activo'
            },
            isNew: true,
            App: this.App,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:interventor', this.service.__saveInterventor.bind(this.service));
    }

    /**
     * Mostrar interventor
     */
    async mostrarInterventor(id: string): Promise<void> {
        try {
            // Asegurarse de que los interventores estén cargados
            await this.service.__findAll();
            
            const interventores = (this.service as any).collections.interventores;
            const model = interventores.get(id);
            
            if (!model) {
                this.App?.trigger('alert:error', 'Interventor no encontrado');
                return;
            }

            const view = new InterventorMostrarView({
                model: model,
                App: this.App,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar interventor:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar interventor');
        }
    }

    /**
     * Editar interventor
     */
    async editarInterventor(id: string): Promise<void> {
        try {
            // Asegurarse de que los interventores estén cargados
            await this.service.__findAll();
            
            const interventores = (this.service as any).collections.interventores;
            const model = interventores.get(id);
            
            if (!model) {
                this.App?.trigger('alert:error', 'Interventor no encontrado');
                return;
            }

            const view = new InterventorCrearView({
                model: model,
                isNew: false,
                App: this.App,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:interventor', this.service.__saveInterventor.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar interventor:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar interventor');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.App?.trigger('alert:error', 'Error en la aplicación de Interventores');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
