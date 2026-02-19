import RepresentanteController from "./RepresentanteController";

declare global {
    var Backbone: any;
    var $App: any;
}

interface RepresentanteRouterOptions {
    [key: string]: any;
}

export default class RepresentanteRouter extends Backbone.Router {
    currentApp: any;

    constructor(options: RepresentanteRouterOptions = {}) {
        super({
            ...options,
            routes: {
                listar: 'listaRepresentantes',
                crear: 'crearRepresentante',
                'editar/:cedula': 'editaRepresentante',
                'mostrar/:cedula': 'mostrarRepresentante',
                '*path': 'defaultRoute',
            },
            currentApp: null,
        });
        this._bindRoutes();
    }

    initialize(): void {
        this.currentApp = $App.startSubApplication(RepresentanteController);
    }

    mostrarRepresentante(cedula: string): boolean {
        if (cedula === '' || cedula === undefined || cedula === void 0) {
            $App.trigger('warning', 'El usuario es requerido.');
            this.navigate('listar', { trigger: true });
            return false;
        }
        this.currentApp.mostrarRepresentante(cedula);
        return true;
    }

    crearRepresentante(): void {
        this.currentApp.crearRepresentante();
    }

    editaRepresentante(cedula: string): boolean {
        if (cedula === '' || cedula === undefined || cedula === void 0) {
            $App.trigger('warning', 'El usuario es requerido.');
            this.navigate('listar', { trigger: true });
            return false;
        }
        this.currentApp.editaRepresentante(cedula);
        return true;
    }

    listaRepresentantes(): void {
        this.currentApp.listaRepresentantes();
    }

    defaultRoute(): void {
        this.navigate('listar', { trigger: true, replace: true });
    }
}
