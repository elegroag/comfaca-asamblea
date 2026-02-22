import { Controller } from "@/common/Controller";
import CargueMasivoCartera from "@/componentes/cartera/views/CargueMasivoCartera";
import CarteraCrear from "@/componentes/cartera/views/CarteraCrear";
import CarteraDetalle from "@/componentes/cartera/views/CarteraDetalle";
import CarterasListar from "@/componentes/cartera/views/CarterasListar";
import Cartera from "@/models/Cartera";
import type { CarteraTransfer } from "./types";
import { CommonDeps } from "@/types/CommonDeps";
import CarteraService, { CarteraCollections } from "./CarteraService";

export default class CarteraController extends Controller {
    private service: CarteraService;

    constructor(options: CommonDeps) {
        super(options);
        this.service = new CarteraService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todas las carteras
     */
    async listaCartera(): Promise<void> {
        try {
            await this.service.__findAll();

            const view = new CarterasListar({
                collection: (this.service as any).collections.carteras,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:cartera', this.service.__deleteCartera.bind(this.service));
            this.listenTo(view, 'edit:cartera', this.editaCartera.bind(this));
            this.listenTo(view, 'show:cartera', this.mostrarDetalle.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar carteras:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar carteras');
        }
    }

    /**
     * Mostrar vista de creación de cartera
     */
    crearCartera(): void {
        const view = new CarteraCrear({
            model: new Cartera(),
            isNew: true,
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:cartera', this.service.__saveCartera.bind(this.service));
    }

    /**
     * Editar una cartera existente
     */
    async editaCartera(id: string): Promise<void> {
        try {
            // Asegurarse de que las carteras estén cargadas
            await this.service.__findAll();

            const carteras = (this.service as any).collections.carteras;
            const model = carteras.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Cartera no encontrada');
                return;
            }

            const view = new CarteraCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:cartera', this.service.__saveCartera.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar cartera:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar cartera');
        }
    }

    /**
     * Mostrar detalle de una cartera
     */
    async mostrarDetalle(id: string): Promise<void> {
        try {
            // Asegurarse de que las carteras estén cargadas
            await this.service.__findAll();

            const carteras = (this.service as any).collections.carteras;
            const model = carteras.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Cartera no encontrada');
                return;
            }

            const view = new CarteraDetalle({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar detalle:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar cartera');
        }
    }

    /**
     * Cargue masivo de carteras
     */
    cargueMasivoCartera(): void {
        const view = new CargueMasivoCartera({
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
        this.app?.trigger('alert:error', 'Error en la aplicación de Cartera');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
