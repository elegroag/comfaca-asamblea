import { Controller } from '@/common/Controller';
import PoderesListarView from '@/componentes/poderes/views/PoderesListarView';
import PoderCrear from '@/componentes/poderes/views/PoderCrear';
import PoderBuscar from '@/componentes/poderes/views/PoderBuscar';
import RechazaPoder from '@/componentes/poderes/views/RechazaPoder';
import PoderMasivo from '@/componentes/poderes/views/PoderMasivo';
import PoderDetalle from '@/componentes/poderes/views/PoderDetalle';
import { CommonDeps } from '@/types/CommonDeps';
import PoderService from './PoderService';
import type { Poder } from './types';

interface PoderesControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class PoderesController extends Controller {
    private service: PoderService;

    constructor(options: PoderesControllerOptions) {
        super(options);
        this.service = new PoderService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todos los poderes
     */
    async listar(): Promise<void> {
        try {
            await this.service.__findAll();

            const view = new PoderesListarView({
                collection: (this.service as any).collections.poderes,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:poder', this.service.__deletePoder.bind(this.service));
            this.listenTo(view, 'edit:poder', this.editarPoder.bind(this));
            this.listenTo(view, 'show:poder', this.mostrarDetalle.bind(this));
            this.listenTo(view, 'activar:poder', this.service.__activarPoder.bind(this.service));
            this.listenTo(view, 'inactivar:poder', this.service.__inactivarPoder.bind(this.service));
            this.listenTo(view, 'export:lista', this.service.__exportLista.bind(this.service));
            this.listenTo(view, 'file:upload', this.service.__uploadMasivo.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar poderes:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar poderes');
        }
    }

    /**
     * Mostrar vista de creación de poder
     */
    crearPoder(): void {
        const view = new PoderCrear({
            model: {
                id: null,
                nombre: '',
                identificacion: '',
                tipo: '',
                estado: 'inactivo'
            },
            isNew: true,
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:poder', this.service.__savePoder.bind(this.service));
    }

    /**
     * Editar un poder existente
     */
    async editarPoder(id: string): Promise<void> {
        try {
            // Asegurarse de que los poderes estén cargados
            await this.service.__findAll();

            const poderes = (this.service as any).collections.poderes;
            const model = poderes.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Poder no encontrado');
                return;
            }

            const view = new PoderCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:poder', this.service.__savePoder.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar poder:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar poder');
        }
    }

    /**
     * Mostrar detalle de un poder
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            // Asegurarse de que los poderes estén cargados
            const result = await this.service.__findPoder(id);

            if (!result) {
                this.app?.trigger('alert:error', 'Poder no encontrado');
                return;
            }

            const { apoderado, poderdante, poder, criteriosRechazos } = result;

            const view = new PoderDetalle({
                model: poder,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
                collection: [
                    {
                        apoderado,
                        poderdante,
                        criteriosRechazos,
                    }
                ]

            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar poder');
        }
    }

    /**
     * Buscar poder
     */
    buscar(): void {
        const view = new PoderBuscar({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);
    }

    /**
     * Crear rechazo de poder
     */
    async crearRechazo(): Promise<void> {
        try {
            const criteriosRechazos = await this.service.__findCriteriosRechazos();

            if (!criteriosRechazos) {
                this.app?.trigger('alert:error', 'Poder no encontrado');
                return;
            }

            const view = new RechazaPoder({
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
                collection: criteriosRechazos
            });

            this.region.show(view);
        } catch (error) {
            this.logger?.error('Error al crear rechazo:', error);
            this.app?.trigger('alert:error', 'Error al crear rechazo');
        }
    }

    /**
     * Cargue masivo de poderes
     */
    cargueMasivo(): void {
        const view = new PoderMasivo({
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
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Poderes');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
