import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import InterventorService from './InterventorService';
import InterventorMostrar from '@/componentes/interventores/views/InterventorMostrar';
import InterventorCrear from '@/componentes/interventores/views/InterventorCrear';
import InterventoresListar from '@/componentes/interventores/views/InterventoresListar';

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

            const view = new InterventoresListar({
                collection: (this.service as any).collections.interventores,
                app: this.app,
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
        const view = new InterventorCrear({
            model: {
                id: null,
                nombre: '',
                identificacion: '',
                email: '',
                telefono: '',
                estado: 'activo'
            },
            isNew: true,
            app: this.app,
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

            const view = new InterventorMostrar({
                model: model,
                app: this.app,
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

            const view = new InterventorCrear({
                model: model,
                isNew: false,
                app: this.app,
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
