'use strict';

import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import TrabajadorService from './TrabajadorService';
import TrabajadorCrear from './TrabajadorCrear';
import TrabajadorMostrar from './TrabajadorMostrar';
import TrabajadoresListar from './TrabajadoresListar';
import TrabajadorCargue from './TrabajadorCargue';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import TrabajadoresCollection from '@/componentes/trabajadores/collections/TrabajadoresCollection';
import Loading from '@/common/Loading';

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
            // Obtener trabajadores desde cache
            let trabajadores = getCachedCollection('trabajadores', TrabajadoresCollection);
            if (trabajadores === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllTrabajadores();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        trabajadores = new TrabajadoresCollection();
                        trabajadores.add(response.trabajadores || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('trabajadores', trabajadores, {
                            persistent: true, // Persistir en localStorage
                            ttl: 60 * 60 * 1000 // 1 hora
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar trabajadores');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar trabajadores:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar trabajadores');
                    return;
                } finally {
                    if (Loading) Loading.hide();
                }
            } else {
                if (Loading) Loading.show();
                setTimeout(() => {
                    if (Loading) Loading.hide();
                }, 300);
            }

            const listView = new TrabajadoresListar({
                collection: trabajadores,
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
            this.app?.trigger('alert:error', error.message || 'Error al cargar trabajadores');
        }
    }

    /**
     * Crear trabajador
     */
    crearTrabajador(): void {
        const view = new TrabajadorCrear({
            app: this.app || undefined,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:trabajador', this.service.__saveTrabajador.bind(this.service));
    }

    /**
     * Mostrar trabajador
     */
    async mostrarTrabajador(id: string): Promise<void> {
        try {
            // Obtener trabajadores desde cache
            let trabajadores = getCachedCollection('trabajadores', TrabajadoresCollection);
            if (trabajadores === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllTrabajadores();
                if (response && response.success === true) {
                    trabajadores = new TrabajadoresCollection();
                    trabajadores.add(response.trabajadores || [], { merge: true });
                    cacheCollection('trabajadores', trabajadores, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
            }

            const model = trabajadores.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Trabajador no encontrado');
                return;
            }

            const view = new TrabajadorMostrar({
                model: model,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar trabajador:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar trabajador');
        }
    }

    /**
     * Editar trabajador
     */
    async editarTrabajador(id: string): Promise<void> {
        try {
            // Obtener trabajadores desde cache
            let trabajadores = getCachedCollection('trabajadores', TrabajadoresCollection);
            if (trabajadores === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllTrabajadores();
                if (response && response.success === true) {
                    trabajadores = new TrabajadoresCollection();
                    trabajadores.add(response.trabajadores || [], { merge: true });
                    cacheCollection('trabajadores', trabajadores, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
            }

            const model = trabajadores.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Trabajador no encontrado');
                return;
            }

            const view = new TrabajadorCrear({
                model: model,
                isNew: false,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:trabajador', this.service.__saveTrabajador.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar trabajador:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar trabajador');
        }
    }

    /**
     * Cargue masivo de trabajadores
     */
    cargueMasivoTrabajador(): void {
        const view = new TrabajadorCargue({
            app: this.app || undefined,
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
        this.app?.trigger('alert:error', 'Error en la aplicación de Trabajadores');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
