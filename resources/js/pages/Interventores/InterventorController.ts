import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import InterventorService from './InterventorService';
import InterventorMostrar from '@/componentes/interventores/views/InterventorMostrar';
import InterventorCrear from '@/componentes/interventores/views/InterventorCrear';
import InterventoresListar from '@/componentes/interventores/views/InterventoresListar';
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import InterventoresCollection from '@/collections/InterventoresCollection';
import Loading from '@/common/Loading';

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
            // Obtener interventores desde cache
            let interventores = getCachedCollection('interventores', InterventoresCollection);
            if (interventores === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllInterventores();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        interventores = new InterventoresCollection();
                        interventores.add(response.interventores || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('interventores', interventores, {
                            persistent: true, // Persistir en localStorage
                            ttl: 35 * 60 * 1000 // 35 minutos
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar interventores');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar interventores:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar interventores');
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

            const view = new InterventoresListar({
                collection: interventores,
                app: this.app || undefined,
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
            this.app?.trigger('alert:error', error.message || 'Error al cargar interventores');
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
            app: this.app || undefined,
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
            // Obtener interventores desde cache
            let interventores = getCachedCollection('interventores', InterventoresCollection);
            if (interventores === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllInterventores();
                if (response && response.success === true) {
                    interventores = new InterventoresCollection();
                    interventores.add(response.interventores || [], { merge: true });
                    cacheCollection('interventores', interventores, {
                        persistent: true,
                        ttl: 35 * 60 * 1000
                    });
                }
            }

            const model = interventores.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Interventor no encontrado');
                return;
            }

            const view = new InterventorMostrar({
                model: model,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar interventor:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar interventor');
        }
    }

    /**
     * Editar interventor
     */
    async editarInterventor(id: string): Promise<void> {
        try {
            // Obtener interventores desde cache
            let interventores = getCachedCollection('interventores', InterventoresCollection);
            if (interventores === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllInterventores();
                if (response && response.success === true) {
                    interventores = new InterventoresCollection();
                    interventores.add(response.interventores || [], { merge: true });
                    cacheCollection('interventores', interventores, {
                        persistent: true,
                        ttl: 35 * 60 * 1000
                    });
                }
            }

            const model = interventores.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Interventor no encontrado');
                return;
            }

            const view = new InterventorCrear({
                model: model,
                isNew: false,
                app: this.app || undefined,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:interventor', this.service.__saveInterventor.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar interventor:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar interventor');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Interventores');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
