import { BackboneRouter } from "@/common/Bone";
import InterventorController from "./InterventorController";
import $App from "@/core/App";

declare global {
    var $App: any;
}

interface RouterInterventorOptions {
    [key: string]: any;
}

export default class RouterInterventor extends BackboneRouter {
    controller: InterventorController;

    constructor(options: RouterInterventorOptions = {}) {
        super({
            routes: {
                '': 'lista_interventores',
                listar: 'lista_interventores',
                crear: 'crear_interventor',
                'mostrar/:usuario': 'mostrar_interventor',
            },
            ...options,
        });

        this.controller = $App.startSubApplication(InterventorController, this);
        this._bindRoutes();
    }

    /**
     * Listar interventores
     */
    lista_interventores(): void {
        console.log('RouterInterventor.lista_interventores() called');

        if (this.controller && typeof this.controller.lista_interventores === 'function') {
            this.controller.lista_interventores();
        }
    }

    /**
     * Crear interventor
     */
    crear_interventor(): void {
        console.log('RouterInterventor.crear_interventor() called');

        if (this.controller && typeof this.controller.crear_interventor === 'function') {
            this.controller.crear_interventor();
        }
    }

    /**
     * Mostrar interventor
     */
    mostrar_interventor(usuario: string): void {
        console.log('RouterInterventor.mostrar_interventor() called', usuario);

        if (this.controller && typeof this.controller.mostrar_interventor === 'function') {
            this.controller.mostrar_interventor(usuario);
        }
    }
}
