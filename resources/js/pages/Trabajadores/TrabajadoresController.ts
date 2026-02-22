'use strict';

import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import TrabajadorService from './TrabajadorService';
import TrabajadorCrear from './TrabajadorCrear';
import TrabajadorMostrar from './TrabajadorMostrar';
import TrabajadoresListar from './TrabajadoresListar';
import TrabajadorCargue from './TrabajadorCargue';

interface TrabajadoresControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class TrabajadoresController extends Controller {
    private service: TrabajadorService;

    constructor(options: TrabajadoresControllerOptions) {
        super(options);
        this.service = new TrabajadorService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todos los trabajadores
     */
    async listarTrabajadores(): Promise<void> {
        try {
            await this.service.__findAll();

            const listView = new TrabajadoresListar({
                collection: (this.service as any).collections.trabajadores,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(listView);

            // Conectar eventos con el servicio
            this.listenTo(listView, 'remove:trabajador', this.service.__removeTrabajador.bind(this.service));
            this.listenTo(listView, 'show:trabajador', this.mostrarTrabajador.bind(this));
            this.listenTo(listView, 'edit:trabajador', this.editarTrabajador.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar trabajadores:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar trabajadores');
        }
    }

    /**
     * Crear trabajador
     */
    crearTrabajador(): void {
        const view = new TrabajadorCrear({
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:trabajador', this.service.__addTrabajadores.bind(this.service));
    }

    /**
     * Mostrar trabajador
     */
    async mostrarTrabajador(id: string): Promise<void> {
        try {
            // Asegurarse de que los trabajadores estén cargados
            await this.service.__findAll();

            const trabajadores = (this.service as any).collections.trabajadores;
            const model = trabajadores.get(id);

            if (!model) {
                this.App?.trigger('alert:error', 'Trabajador no encontrado');
                return;
            }

            const view = new TrabajadorMostrar({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar trabajador:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar trabajador');
        }
    }

    /**
     * Editar trabajador
     */
    async editarTrabajador(id: string): Promise<void> {
        try {
            // Asegurarse de que los trabajadores estén cargados
            await this.service.__findAll();

            const trabajadores = (this.service as any).collections.trabajadores;
            const model = trabajadores.get(id);

            if (!model) {
                this.App?.trigger('alert:error', 'Trabajador no encontrado');
                return;
            }

            const view = new TrabajadorCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:trabajador', this.service.__addTrabajadores.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar trabajador:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar trabajador');
        }
    }

    /**
     * Cargue masivo de trabajadores
     */
    cargueMasivoTrabajador(): void {
        const view = new TrabajadorCargue({
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
        this.App?.trigger('alert:error', 'Error en la aplicación de Trabajadores');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
