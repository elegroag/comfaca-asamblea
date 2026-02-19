import { Controller } from '@/common/Controller';
import UsuariosListar from "@/componentes/usuarios/views/UsuariosListar";
import UsuarioCrear from "@/componentes/usuarios/views/UsuarioCrear";
import UsuarioMostrar from "@/componentes/usuarios/views/UsuarioMostrar";
import UsuariosCargue from "@/componentes/usuarios/views/UsuariosCargue";
import UsuariosListarAsa from "@/componentes/usuarios/views/UsuariosListarAsa";
import SubNavUsuarios from "@/componentes/usuarios/views/SubNavUsuarios";
import $App from "@/core/App";

// Declaraciones para las colecciones globales
declare global {
    var $: any;
    var _: any;
    var $App: any;
    var create_url: (path: string) => string;
    var loading: {
        show: (show?: boolean) => void;
        hide: (hide?: boolean) => void;
    };
    var scroltop: () => void;
    var axios: {
        get: (url: string) => Promise<any>;
        post: (url: string, data: any) => Promise<any>;
    };
    var Usuario: any;
    var UsuariosCollection: any;
    var AsaUsuario: any;
    var AsaUsuariosCollection: any;
    var Asamblea: any;
    var Mesa: any;
    var MesasCollection: any;
}

interface UsuarioControllerOptions {
    region?: {
        el: HTMLElement;
        id: string;
    };
    router?: any;
    logger?: any;
    api?: any;
}

export default class UsuarioController extends Controller {
    private asamblea: any;
    public currentView: any;
    public Collections: any;

    constructor(options: UsuarioControllerOptions = {}) {
        super(options);
        this.asamblea = null;
        this.currentView = null;
        this.Collections = {
            usuarios: new UsuariosCollection(),
            asa_usuarios: new AsaUsuariosCollection(),
            mesas_disponibles: new MesasCollection(),
            asamblea: null,
        };
        this.__initializeCollections();
    }

    /**
     * Inicializar las colecciones necesarias
     */
    private __initializeCollections(): void {
        if ($App && $App.Collections) {
            $App.Collections.usuarios = undefined;
            $App.Collections.asa_usuarios = undefined;
            $App.Collections.mesas_disponibles = undefined;
            $App.Collections.asamblea = undefined;
        }
    }

    /**
     * Listar usuarios de asamblea
     */
    async listaUsuariosAsamblea(): Promise<void> {
        console.log('UsuarioController.listaUsuariosAsamblea() called');

        try {
            this.__createContent();
            const url = create_url('admin/listar_usuarios_asa');
            loading.show(true);

            const salida = await axios.get(url);
            loading.hide(true);

            if (salida && salida.status === 200 && salida.data) {
                this.Collections.asa_usuarios.add(salida.data.asa_usuarios, { merge: true });

                if (salida.data.asamblea && typeof Asamblea !== 'undefined') {
                    this.asamblea = new Asamblea(salida.data.asamblea);
                    this.Collections.asamblea = this.asamblea;
                }

                const view = new UsuariosListarAsa({
                    model: this.asamblea,
                    collection: this.Collections.asa_usuarios,
                });

                this.currentView = view;
                $(this.region.el).html(view.render().el);
            } else {
                this.trigger('alert:error', { message: 'Error al listar usuarios de asamblea' });
                this.router?.navigate('error', { trigger: true });
            }
        } catch (err: any) {
            loading.hide(true);
            console.error('Error al listar usuarios de asamblea:', err);
            this.trigger('alert:error', { message: 'Error de conexión al listar usuarios de asamblea' });
            this.router?.navigate('error', { trigger: true });
        }
    }

    /**
     * Listar usuarios de caja
     */
    async listarUsuariosCaja(): Promise<void> {
        console.log('UsuarioController.listarUsuariosCaja() called');

        try {
            this.__createContent();
            const url = create_url('admin/listar_usuarios');
            loading.show(true);

            const salida = await axios.get(url);
            loading.hide(true);

            if (salida && salida.status === 200 && salida.data) {
                this.Collections.usuarios.add(salida.data.usuarios, { merge: true });

                const view = new UsuariosListar({
                    collection: this.Collections.usuarios,
                });

                this.currentView = view;
                $(this.region.el).html(view.render().el);
            } else {
                this.trigger('alert:error', { message: 'Error al listar usuarios de caja' });
                this.router?.navigate('error', { trigger: true });
            }
        } catch (err: any) {
            loading.hide(true);
            console.error('Error al listar usuarios de caja:', err);
            this.trigger('alert:error', { message: 'Error de conexión al listar usuarios de caja' });
            this.router?.navigate('error', { trigger: true });
        }
    }

    /**
     * Crear nuevo usuario
     */
    crearUsuario(): void {
        console.log('UsuarioController.crearUsuario() called');

        this.__createContent();
        const model = new Usuario();
        const view = new UsuarioCrear({
            model,
            isNew: true
        });

        this.currentView = view;
        $(this.region.el).html(view.render().el);

        // Escuchar eventos si el método está disponible
        if (typeof this.listenTo === 'function') {
            this.listenTo(view, 'add:usuario_sisu', this.__addUsuarioSisu);
        }
    }

    /**
     * Mostrar detalle de un usuario
     */
    async mostrarUsuario(usuario: string = ''): Promise<void> {
        console.log('UsuarioController.mostrarUsuario() called', usuario);

        if (!usuario || usuario.trim() === '') {
            this.trigger('warning', 'El usuario es requerido.');
            this.router?.navigate('listar', { trigger: true });
            return;
        }

        try {
            this.__createContent();
            const url = create_url('admin/usuario_detalle/' + usuario);
            loading.show(true);

            const salida = await axios.get(url);
            loading.hide(true);

            if (salida && salida.data) {
                // Inicializar asamblea si existe
                if (salida.data.asamblea && typeof Asamblea !== 'undefined') {
                    this.asamblea = new Asamblea(salida.data.asamblea);
                    this.Collections.asamblea = this.asamblea;
                }

                const usuarioModel = new Usuario(salida.data.usuario);
                const usuarioAsa = salida.data.asa_usuario ? new AsaUsuario(salida.data.asa_usuario) : false;
                const mesa = salida.data.mesa ? new Mesa(salida.data.mesa) : false;
                const roles = salida.data.roles || false;
                const mesasDisponibles = salida.data.mesas_disponibles
                    ? new MesasCollection(salida.data.mesas_disponibles)
                    : false;

                if (mesasDisponibles) {
                    this.Collections.mesas_disponibles.add(mesasDisponibles.toJSON(), { merge: true });
                }

                const view = new UsuarioMostrar({
                    model: usuarioModel,
                    collection: [
                        {
                            asamblea: this.asamblea,
                            usuarioAsa,
                            mesa,
                            mesasDisponibles,
                            roles,
                        },
                    ],
                });

                this.currentView = view;
                $(this.region.el).html(view.render().el);
            } else {
                this.trigger('alert:error', { message: 'Respuesta inválida al obtener usuario' });
                this.router?.navigate('error', { trigger: true });
            }
        } catch (err: any) {
            loading.hide(true);
            console.error('Error al obtener usuario:', err);
            this.trigger('alert:error', { message: 'Error de conexión al obtener usuario' });
            this.router?.navigate('error', { trigger: true });
        }
    }

    /**
     * Editar usuario SISU
     */
    async editaUserSisu(usuario: string): Promise<void> {
        console.log('UsuarioController.editaUserSisu() called', usuario);

        if (!usuario || usuario.trim() === '') {
            this.trigger('warning', 'El usuario es requerido.');
            this.router?.navigate('listar', { trigger: true });
            return;
        }

        try {
            this.__createContent();
            const url = create_url('admin/usuario_detalle/' + usuario);
            loading.show(true);

            const salida = await axios.get(url);
            loading.hide(true);

            if (salida && salida.data) {
                const usuarioModel = new Usuario(salida.data.usuario);
                const view = new UsuarioCrear({
                    model: usuarioModel,
                    isNew: false
                });

                this.currentView = view;
                $(this.region.el).html(view.render().el);

                // Escuchar eventos si el método está disponible
                if (typeof this.listenTo === 'function') {
                    this.listenTo(view, 'add:usuario_sisu', this.__addUsuarioSisu);
                }
            } else {
                this.trigger('alert:error', { message: 'Respuesta inválida al obtener usuario para editar' });
                this.router?.navigate('error', { trigger: true });
            }
        } catch (err: any) {
            loading.hide(true);
            console.error('Error al obtener usuario para editar:', err);
            this.trigger('alert:error', { message: 'Error de conexión al obtener usuario para editar' });
            this.router?.navigate('error', { trigger: true });
        }
    }

    /**
     * Cargar usuarios de caja
     */
    cargarUsuariosCaja(): void {
        console.log('UsuarioController.cargarUsuariosCaja() called');

        this.__createContent();
        const view = new UsuariosCargue();

        this.currentView = view;
        $(this.region.el).html(view.render().el);
    }

    /**
     * Crear el contenido principal
     */
    private __createContent(): HTMLElement {
        $(this.region.el).remove();
        const _el = document.createElement('div');
        _el.setAttribute('id', this.region.id);

        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(_el);
        }

        if (scroltop) {
            scroltop();
        }

        return _el;
    }

    /**
     * Agregar usuario SISU
     */
    private __addUsuarioSisu(usuario: any): void {
        this.__initUsuariosSisu();
        const _usuario = usuario instanceof Usuario ? usuario : new Usuario(usuario);

        if (this.Collections.usuarios && typeof this.Collections.usuarios.add === 'function') {
            this.Collections.usuarios.add(_usuario, { merge: true });
        }
    }

    /**
     * Inicializar usuarios SISU
     */
    private __initUsuariosSisu(): void {
        if (!this.Collections.usuarios && typeof UsuariosCollection !== 'undefined') {
            this.Collections.usuarios = new UsuariosCollection();
            if (typeof this.Collections.usuarios.reset === 'function') {
                this.Collections.usuarios.reset();
            }
        }
    }
}
