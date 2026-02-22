import { Controller } from '@/common/Controller';
import AsambleaDetalle from '@/componentes/asamblea/views/AsambleaDetalle';
import AsambleaListar from '@/componentes/asamblea/views/AsambleaListar';
import AsambleaActiva from '@/componentes/asamblea/views/AsambleaActiva';
import { CommonDeps } from '@/types/CommonDeps';
import AsambleaService from './AsambleaService';

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
            await this.service.__findAll();

            const view = new AsambleaActiva({
                collection: (this.service as any).collections.asambleas,
                app: this.app,
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
            await this.service.__findAll();

            const view = new AsambleaListar({
                collection: (this.service as any).collections.asambleas,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:asamblea', this.service.__deleteAsamblea.bind(this.service));
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
            // Asegurarse de que las asambleas estén cargadas
            await this.service.__findAll();

            const asambleas = (this.service as any).collections.asambleas;
            const model = asambleas.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Asamblea no encontrada');
                return;
            }

            const view = new AsambleaDetalle({
                model: model,
                app: this.app,
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
            app: this.app,
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
