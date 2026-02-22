import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import RepresentanteService from './RepresentanteService';
import RepresentantesListar from '@/componentes/representantes/views/RepresentanteListar';
import RepresentanteCrear from '@/componentes/representantes/views/RepresentanteCrear';
import RepresentanteMostrar from '@/componentes/representantes/views/RepresentanteMostrar';

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
            await this.service.__findAll();

            const view = new RepresentantesListar({
                collection: (this.service as any).collections.representantes,
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
            model: {
                id: null,
                nombre: '',
                identificacion: '',
                email: '',
                telefono: '',
                empresa_id: null,
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
        this.listenTo(view, 'add:representante', this.service.__saveRepresentante.bind(this.service));
    }

    /**
     * Mostrar representante
     */
    async mostrarRepresentante(id: string): Promise<void> {
        try {
            // Asegurarse de que los representantes estén cargados
            await this.service.__findAll();

            const representantes = (this.service as any).collections.representantes;
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
            // Asegurarse de que los representantes estén cargados
            await this.service.__findAll();

            const representantes = (this.service as any).collections.representantes;
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
     * Editar representante (alias para router)
     */
    editaRepresentante(cedula: string): void {
        this.editarRepresentante(cedula);
    }

    /**
     * Cargar representantes masivamente
     */
    cargarMasivo(): void {
        const view = new RepresentanteCrear({
            model: {
                id: null,
                nombre: '',
                identificacion: '',
                email: '',
                telefono: '',
                empresa_id: null,
                estado: 'activo'
            },
            isNew: true,
            isMasivo: true,
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
     * Buscar representantes por criterio
     */
    async buscarRepresentantes(criterio: string): Promise<void> {
        try {
            const representantes = await this.service.__buscarRepresentantes(criterio);

            // Crear una vista temporal para mostrar los resultados
            const view = new RepresentantesListar({
                collection: new (this.app as any).Collection(representantes),
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
