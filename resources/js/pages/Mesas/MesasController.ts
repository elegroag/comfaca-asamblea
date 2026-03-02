import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import MesasService from './MesasService';
import MesasListar from '@/componentes/mesas/views/MesasListar';
import MesasCrear from '@/componentes/mesas/views/MesasCrear';
import MesaMostrar from '@/componentes/mesas/views/MesaMostrar';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import MesasCollection from '@/collections/MesasCollection';
import Loading from '@/common/Loading';

interface MesasControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class MesasController extends Controller {
    private service: MesasService;

    constructor(options: MesasControllerOptions) {
        super(options);
        this.service = new MesasService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar todas las mesas
     */
    async listarMesas(): Promise<void> {
        try {
            // Obtener mesas desde cache
            let mesas = getCachedCollection('mesas', MesasCollection);
            if (mesas === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllMesas();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        mesas = new MesasCollection();
                        mesas.add(response.mesas || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('mesas', mesas, {
                            persistent: true, // Persistir en localStorage
                            ttl: 30 * 60 * 1000 // 30 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar mesas');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar mesas:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar mesas');
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

            const view = new MesasListar({
                collection: mesas,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:mesa', this.service.__removeMesa.bind(this.service));
            this.listenTo(view, 'show:mesa', this.mostrarMesa.bind(this));
            this.listenTo(view, 'edit:mesa', this.editarMesa.bind(this));
            this.listenTo(view, 'activar:mesa', this.service.__activarMesa.bind(this.service));
            this.listenTo(view, 'inactivar:mesa', this.service.__inactivarMesa.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar mesas:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar mesas');
        }
    }

    /**
     * Crear mesa
     */
    crearMesa(): void {
        const view = new MesasCrear({
            model: {
                id: null,
                nombre: '',
                descripcion: '',
                capacidad: 0,
                estado: 'inactivo'
            },
            isNew: true,
            app: this.app || undefined,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'add:mesa', this.service.__saveMesa.bind(this.service));
    }

    /**
     * Mostrar mesa
     */
    async mostrarMesa(id: string): Promise<void> {
        try {
            // Obtener mesas desde cache
            let mesas = getCachedCollection('mesas', MesasCollection);
            if (mesas === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllMesas();
                if (response && response.success === true) {
                    mesas = new MesasCollection();
                    mesas.add(response.mesas || [], { merge: true });
                    cacheCollection('mesas', mesas, {
                        persistent: true,
                        ttl: 30 * 60 * 1000
                    });
                }
            }

            const model = mesas.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Mesa no encontrada');
                return;
            }

            const view = new MesaMostrar({
                model: model,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar mesa:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar mesa');
        }
    }

    /**
     * Editar mesa
     */
    async editarMesa(id: string): Promise<void> {
        try {
            // Obtener mesas desde cache
            let mesas = getCachedCollection('mesas', MesasCollection);
            if (mesas === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllMesas();
                if (response && response.success === true) {
                    mesas = new MesasCollection();
                    mesas.add(response.mesas || [], { merge: true });
                    cacheCollection('mesas', mesas, {
                        persistent: true,
                        ttl: 30 * 60 * 1000
                    });
                }
            }

            const model = mesas.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Mesa no encontrada');
                return;
            }

            const view = new MesasCrear({
                model: model,
                isNew: false,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:mesa', this.service.__saveMesa.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar mesa:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar mesa');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Mesas');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
