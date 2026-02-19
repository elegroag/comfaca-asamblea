import { BackboneRouter } from "@/common/Bone";
import UsuarioController from "./UsuarioController";
import $App from "@/core/App";

declare global {
    var $App: any;
}

interface RouterUsuariosOptions {
    routes?: Record<string, string>;
    controller?: any;
}

export default class RouterUsuarios extends BackboneRouter {
    controller: UsuarioController;

    constructor(options: RouterUsuariosOptions = {}) {
        super({
            routes: {
                '': 'listaUsuariosAsa',
                'listar': 'listaUsuariosAsa',
                'crear': 'crearUsuario',
                'crear_user_asamblea': 'crearUsuarioAsa',
                'listar_comfaca': 'listarUsuariosCaja',
                'mostrar/:usuario': 'mostrarUsuario',
                'cargue_comfaca': 'cargarUsuariosCaja',
                'edita_usersisu/:usuario': 'editaUserSisu',
            },
            ...options,
        });

        this.controller = $App.startSubApplication(UsuarioController, this);
        this._bindRoutes();
    }

    /**
     * Manejar ruta de error
     */
    error(): void {
        console.log('RouterUsuarios.error() called');
        // UsuarioController no tiene método error, pero seguimos el patrón
    }

    /**
     * Listar usuarios de asamblea
     */
    listaUsuariosAsa(): void {
        console.log('RouterUsuarios.listaUsuariosAsa() called');
        if (this.controller && typeof this.controller.listaUsuariosAsamblea === 'function') {
            this.controller.listaUsuariosAsamblea();
        }
    }

    /**
     * Crear nuevo usuario
     */
    crearUsuario(): void {
        console.log('RouterUsuarios.crearUsuario() called');
        if (this.controller && typeof this.controller.crearUsuario === 'function') {
            this.controller.crearUsuario();
        }
    }

    /**
     * Crear usuario de asamblea
     */
    crearUsuarioAsa(): void {
        console.log('RouterUsuarios.crearUsuarioAsa() called');
        if (this.controller && typeof this.controller.crearUsuario === 'function') {
            // UsuarioController usa crearUsuario para ambos casos
            this.controller.crearUsuario();
        }
    }

    /**
     * Listar usuarios de caja
     */
    listarUsuariosCaja(): void {
        console.log('RouterUsuarios.listarUsuariosCaja() called');
        if (this.controller && typeof this.controller.listarUsuariosCaja === 'function') {
            this.controller.listarUsuariosCaja();
        }
    }

    /**
     * Mostrar detalle de usuario
     */
    mostrarUsuario(usuario: string): boolean {
        console.log('RouterUsuarios.mostrarUsuario() called', usuario);

        if (!usuario || usuario.trim() === '') {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('warning', 'El usuario es requerido.');
            }
            this.navigate('listar', { trigger: true });
            return false;
        }

        if (this.controller && typeof this.controller.mostrarUsuario === 'function') {
            this.controller.mostrarUsuario(usuario);
            return true;
        } else {
            console.error('Controller.mostrarUsuario no está disponible');
            return false;
        }
    }

    /**
     * Editar usuario SISU
     */
    editaUserSisu(usuario: string): boolean {
        console.log('RouterUsuarios.editaUserSisu() called', usuario);

        if (!usuario || usuario.trim() === '') {
            if ($App && typeof $App.trigger === 'function') {
                $App.trigger('warning', 'El usuario es requerido.');
            }
            this.navigate('listar', { trigger: true });
            return false;
        }

        if (this.controller && typeof this.controller.editaUserSisu === 'function') {
            this.controller.editaUserSisu(usuario);
            return true;
        } else {
            console.error('Controller.editaUserSisu no está disponible');
            return false;
        }
    }

    /**
     * Cargar usuarios de caja
     */
    cargarUsuariosCaja(): void {
        console.log('RouterUsuarios.cargarUsuariosCaja() called');
        if (this.controller && typeof this.controller.cargarUsuariosCaja === 'function') {
            this.controller.cargarUsuariosCaja();
        }
    }
}
