import { Controller } from '@/common/Controller';
import { CommonDeps } from '@/types/CommonDeps';
import UsuarioService from './UsuarioService';
import UsuariosListar from "@/componentes/usuarios/views/UsuariosListar";
import UsuarioCrear from "@/componentes/usuarios/views/UsuarioCrear";
import UsuarioMostrar from "@/componentes/usuarios/views/UsuarioMostrar";
import UsuariosCargue from "@/componentes/usuarios/views/UsuariosCargue";
import UsuariosListarAsa from "@/componentes/usuarios/views/UsuariosListarAsa";
import SubNavUsuarios from "@/componentes/usuarios/views/SubNavUsuarios";
import { cacheCollection, getCachedCollection } from '@/componentes/CacheManager';
import AsaUsuariosCollection from '@/collections/AsaUsuariosCollection';
import Loading from '@/common/Loading';

interface UsuarioControllerOptions extends CommonDeps {
    [key: string]: any;
}

export default class UsuarioController extends Controller {
    private service: UsuarioService;

    constructor(options: UsuarioControllerOptions) {
        super(options);
        this.service = new UsuarioService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Listar usuarios de asamblea
     */
    async listaUsuariosAsamblea(): Promise<void> {
        try {
            // Obtener usuarios desde cache
            let usuarios = getCachedCollection('usuarios', AsaUsuariosCollection);
            if (usuarios === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllUsuarios();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        usuarios = new AsaUsuariosCollection();
                        usuarios.add(response.usuarios || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('usuarios', usuarios, {
                            persistent: true, // Persistir en localStorage
                            ttl: 60 * 60 * 1000 // 1 hora
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar usuarios');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar usuarios:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar usuarios');
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

            const subNav = new SubNavUsuarios({
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
                dataToggle: {
                    listar: true,
                    crear: true,
                    editar: true,
                    exportar: true,
                    masivo: true
                }
            });

            const body = this.region.getRegion('body');
            if (body) {
                body.show(subNav);
            }

            const listView = new UsuariosListarAsa({
                collection: usuarios,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: body,
            });

            if (body) {
                body.show(listView);
            }

            // Conectar eventos con el servicio
            this.listenTo(listView, 'remove:usuario', this.service.__removeUsuario.bind(this.service));
            this.listenTo(listView, 'show:usuario', this.mostrarUsuario.bind(this));
            this.listenTo(listView, 'edit:usuario', this.editarUsuario.bind(this));

        } catch (error: any) {
            this.logger?.error('Error al listar usuarios:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar usuarios');
        }
    }

    /**
     * Crear usuario
     */
    crearUsuario(): void {
        const view = new UsuarioCrear({
            model: {
                id: null,
                nombre: '',
                email: '',
                rol: '',
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
        this.listenTo(view, 'add:usuario', this.service.__saveUsuario.bind(this.service));
    }

    /**
     * Crear usuario de asamblea
     */
    crearUsuarioAsa(): void {
        const view = new UsuarioCrear({
            model: {
                id: null,
                nombre: '',
                email: '',
                rol: 'asa_usuario',
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
        this.listenTo(view, 'add:usuario', this.service.__saveUsuario.bind(this.service));
    }

    /**
     * Listar usuarios de caja
     */
    async listarUsuariosCaja(): Promise<void> {
        try {
            // Obtener usuarios desde cache
            let usuarios = getCachedCollection('usuarios', AsaUsuariosCollection);
            if (usuarios === null) {
                if (Loading) Loading.show();

                try {
                    if (!this.api) {
                        this.app?.trigger('error', 'API no disponible');
                        return;
                    }

                    const response = await this.service.findAllUsuarios();

                    if (response && response.success === true) {
                        // Crear collection y guardar en cache
                        usuarios = new AsaUsuariosCollection();
                        usuarios.add(response.usuarios || [], { merge: true });

                        // Guardar en cache para uso futuro
                        cacheCollection('usuarios', usuarios, {
                            persistent: true, // Persistir en localStorage
                            ttl: 60 * 60 * 1000 // 1 hora
                        });
                    } else {
                        this.app?.trigger('error', (response as any).msj || response.message || 'Error al listar usuarios');
                        return;
                    }
                } catch (error: any) {
                    this.logger.error('Error al listar usuarios:', error);
                    this.app?.trigger('error', error.message || 'Error de conexión al listar usuarios');
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

            const view = new UsuariosListar({
                collection: usuarios,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'remove:usuario', this.service.__removeUsuario.bind(this.service));
            this.listenTo(view, 'show:usuario', this.mostrarUsuario.bind(this));
            this.listenTo(view, 'edit:usuario', this.editarUsuario.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al listar usuarios:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar usuarios');
        }
    }

    /**
     * Mostrar usuario
     */
    async mostrarUsuario(id: string): Promise<void> {
        try {
            // Obtener usuarios desde cache
            let usuarios = getCachedCollection('usuarios', AsaUsuariosCollection);
            if (usuarios === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllUsuarios();
                if (response && response.success === true) {
                    usuarios = new AsaUsuariosCollection();
                    usuarios.add(response.usuarios || [], { merge: true });
                    cacheCollection('usuarios', usuarios, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
            }

            const model = usuarios.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Usuario no encontrado');
                return;
            }

            const view = new UsuarioMostrar({
                model: model,
                app: this.app,
                api: this.api,
                logger: this.logger,
            });

            this.region.show(view);

        } catch (error: any) {
            this.logger?.error('Error al mostrar usuario:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar usuario');
        }
    }

    /**
     * Editar usuario
     */
    async editarUsuario(id: string): Promise<void> {
        try {
            // Obtener usuarios desde cache
            let usuarios = getCachedCollection('usuarios', AsaUsuariosCollection);
            if (usuarios === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllUsuarios();
                if (response && response.success === true) {
                    usuarios = new AsaUsuariosCollection();
                    usuarios.add(response.usuarios || [], { merge: true });
                    cacheCollection('usuarios', usuarios, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
            }

            const model = usuarios.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Usuario no encontrado');
                return;
            }

            const view = new UsuarioCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:usuario', this.service.__saveUsuario.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar usuario:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar usuario');
        }
    }

    /**
     * Cargar usuarios de caja
     */
    cargarUsuariosCaja(): void {
        const view = new UsuariosCargue({
            app: this.app,
            api: this.api,
            logger: this.logger,
        });

        this.region.show(view);

        // Conectar eventos con el servicio
        this.listenTo(view, 'file:upload', this.service.__cargarUsuarios.bind(this.service));
    }

    /**
     * Editar usuario SISU
     */
    async editaUserSisu(id: string): Promise<void> {
        try {
            // Obtener usuarios desde cache
            let usuarios = getCachedCollection('usuarios', AsaUsuariosCollection);
            if (usuarios === null) {
                // Si no está en cache, cargar desde API
                const response = await this.service.findAllUsuarios();
                if (response && response.success === true) {
                    usuarios = new AsaUsuariosCollection();
                    usuarios.add(response.usuarios || [], { merge: true });
                    cacheCollection('usuarios', usuarios, {
                        persistent: true,
                        ttl: 60 * 60 * 1000
                    });
                }
            }

            const model = usuarios.get(id);

            if (!model) {
                this.app?.trigger('alert:error', 'Usuario no encontrado');
                return;
            }

            const view = new UsuarioCrear({
                model: model,
                isNew: false,
                app: this.app,
                api: this.api,
                logger: this.logger,
                region: this.region,
            });

            this.region.show(view);

            // Conectar eventos con el servicio
            this.listenTo(view, 'add:usuario', this.service.__saveUsuario.bind(this.service));

        } catch (error: any) {
            this.logger?.error('Error al editar usuario SISU:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar usuario');
        }
    }

    /**
     * Manejar errores
     */
    error(): void {
        this.app?.trigger('alert:error', 'Error en la aplicación de Usuarios');
    }

    /**
     * Limpiar recursos
     */
    destroy(): void {
        this.stopListening();
        this.region.remove();
    }
}
