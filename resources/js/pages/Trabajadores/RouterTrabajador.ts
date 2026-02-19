import TrabajadoresController from "./TrabajadoresController";

declare global {
    var Backbone: any;
    var $App: any;
}

interface RouterTrabajadorOptions {
    [key: string]: any;
}

export default class RouterTrabajador extends Backbone.Router {
    constructor(options: RouterTrabajadorOptions = {}) {
        super({
            ...options,
            routes: {
                listar: 'listaTrabajadores',
                crear: 'crearTrabajador',
                'mostrar/:cedula': 'mostrarTrabajador',
                cargue: 'cargueTrabajador',
            },
        });
        this._bindRoutes();
    }

    main(): any {
        return $App.startSubApplication(TrabajadoresController);
    }

    listaTrabajadores(): void {
        const app = this.main();
        app.listarTrabajadores();
    }

    mostrarTrabajador(): void {
        const app = this.main();
        app.mostrar_trabajador();
    }

    crearTrabajador(): void {
        const app = this.main();
        app.crearTrabajador();
    }

    cargueTrabajador(): void {
        const app = this.main();
        app.cargueTrabajador();
    }
}
