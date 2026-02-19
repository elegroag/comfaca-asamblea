import { BackboneRouter } from "@/common/Bone";
import CarteraController from "./CarteraController";
import $App from "@/core/App";

class CarteraRouter extends BackboneRouter {
    controller: CarteraController;

    constructor(options = {}) {
        super({
            routes: {
                '': 'listar',
                'listar': 'listar',
                'crear': 'crear',
                'cargue': 'cargueMasivo',
                'mostrar/:id': 'mostrar',
                'editar/:id': 'editar',
                'error': 'error'
            },
            ...options,
        });

        this.controller = $App.startSubApplication(CarteraController, this);
        this._bindRoutes();
    }

    error() {
        console.log('CarteraRouter.error() called');
        this.controller.error();
    }

    listar() {
        console.log('CarteraRouter.listar() called');
        this.controller.listaCartera();
    }

    crear() {
        console.log('CarteraRouter.crear() called');
        this.controller.crearCartera();
    }

    editar(id: string) {
        console.log('CarteraRouter.editar() called', id);
        if (!id || id === undefined || id === void 0) {
            $App.trigger('warning', 'El id de la cartera es requerido.');
            this.navigate('listar', { trigger: true });
            return false;
        }
        this.controller.editaCartera(id);
    }

    mostrar(id: string) {
        console.log('CarteraRouter.mostrar() called', id);
        if (!id || id === undefined || id === void 0) {
            $App.trigger('warning', 'El id de la cartera es requerido.');
            this.navigate('listar', { trigger: true });
            return false;
        }
        this.controller.mostrarDetalle(id);
    }

    cargueMasivo() {
        console.log('CarteraRouter.cargueMasivo() called');
        this.controller.cargueMasivoCartera();
    }
}

export default CarteraRouter;
