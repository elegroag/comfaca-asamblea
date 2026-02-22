import { BackboneRouter } from "@/common/Bone";
import UsuarioController from "./UsuarioController";
import type { AppInstance } from "@/types/types";

interface RouterUsuariosOptions {
    app: AppInstance;
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterUsuarios extends BackboneRouter {
    controller: UsuarioController | null = null;
    private app: AppInstance;

    constructor(options: RouterUsuariosOptions) {
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

        // Patrón descentralizado: inyección directa del app
        this.app = options.app;
        this._bindRoutes();
    }

    private init() {
        // Patrón descentralizado: usar app.startSubApplication()
        this.controller = this.app.startSubApplication(UsuarioController);
    }

    /**
     * Manejar ruta de error
     */
    error(): void {
        this.init();
        console.log('RouterUsuarios.error() called');
        if (this.controller && typeof this.controller.error === 'function') {
            this.controller.error();
        }
    }

    /**
     * Listar usuarios de asamblea
     */
    listaUsuariosAsa(): void {
        this.init();
        console.log('RouterUsuarios.listaUsuariosAsa() called');
        if (this.controller && typeof this.controller.listaUsuariosAsamblea === 'function') {
            this.controller.listaUsuariosAsamblea();
        }
    }

    /**
     * Crear usuario
     */
    crearUsuario(): void {
        this.init();
        console.log('RouterUsuarios.crearUsuario() called');
        if (this.controller && typeof this.controller.crearUsuario === 'function') {
            this.controller.crearUsuario();
        }
    }

    /**
     * Crear usuario de asamblea
     */
    crearUsuarioAsa(): void {
        this.init();
        console.log('RouterUsuarios.crearUsuarioAsa() called');
        if (this.controller && typeof this.controller.crearUsuarioAsa === 'function') {
            this.controller.crearUsuarioAsa();
        }
    }

    /**
     * Listar usuarios de caja
     */
    listarUsuariosCaja(): void {
        this.init();
        console.log('RouterUsuarios.listarUsuariosCaja() called');
        if (this.controller && typeof this.controller.listarUsuariosCaja === 'function') {
            this.controller.listarUsuariosCaja();
        }
    }

    /**
     * Mostrar usuario
     */
    mostrarUsuario(usuario: string): void {
        this.init();
        console.log('RouterUsuarios.mostrarUsuario() called', usuario);
        if (this.controller && typeof this.controller.mostrarUsuario === 'function') {
            this.controller.mostrarUsuario(usuario);
        }
    }

    /**
     * Cargar usuarios de caja
     */
    cargarUsuariosCaja(): void {
        this.init();
        console.log('RouterUsuarios.cargarUsuariosCaja() called');
        if (this.controller && typeof this.controller.cargarUsuariosCaja === 'function') {
            this.controller.cargarUsuariosCaja();
        }
    }

    /**
     * Editar usuario SISU
     */
    editaUserSisu(usuario: string): void {
        this.init();
        console.log('RouterUsuarios.editaUserSisu() called', usuario);
        if (this.controller && typeof this.controller.editaUserSisu === 'function') {
            this.controller.editaUserSisu(usuario);
        }
    }
}
