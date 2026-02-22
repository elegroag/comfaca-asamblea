import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import NovedadesService from './NovedadesService';
import NovedadesListar from '@/componentes/novedades/views/NovedadesListar';
import NovedadDetalle from '@/componentes/novedades/views/NovedadDetalle';

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
            await this.service.__findAll();

            const view = new NovedadesListar({
                collection: (this.service as any).collections.novedades,
                App: this.App,
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
            this.App?.trigger('alert:error', error.message || 'Error al cargar novedades');
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
            // Asegurarse de que las novedades estén cargadas
            await this.service.__findAll();

            const novedades = (this.service as any).collections.novedades;
            const model = novedades.get(id);

            if (!model) {
                this.App?.trigger('alert:error', 'Novedad no encontrada');
                return;
            }

            const view = new NovedadDetalle({
                model: model,
                App: this.App,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar novedad');
        }
    }

    /**
     * Editar novedad
     */
    async editarNovedad(id: string): Promise<void> {
        try {
            // Asegurarse de que las novedades estén cargadas
            await this.service.__findAll();

            const novedades = (this.service as any).collections.novedades;
            const model = novedades.get(id);

            if (!model) {
                this.App?.trigger('alert:error', 'Novedad no encontrada');
                return;
            }

            // Implementación básica temporal
            this.region.show(`<div class="p-4">Editar novedad: ${id} (vista temporal)</div>`);

        } catch (error: any) {
            this.logger?.error('Error al editar novedad:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar novedad');
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
                collection: new (this.App as any).Collection(noLeidas),
                App: this.App,
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
            this.App?.trigger('alert:error', error.message || 'Error al cargar novedades');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.App?.trigger('alert:error', 'Error en la aplicación de Novedades');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
