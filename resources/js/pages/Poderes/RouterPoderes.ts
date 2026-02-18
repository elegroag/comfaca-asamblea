import { BackboneRouter } from "@/common/Bone";
import PoderesController from "./PoderesController";
import $App from "@/core/App";

class RouterPoderes extends BackboneRouter {
    controller: PoderesController;

    constructor(options = {}) {
        super({
            routes: {
                '': 'listar',
                'listar': 'listar',
                'buscar': 'buscar',
                'crear': 'crear',
                'mostrar/:documento': 'mostrar',
                'buscar_apoderado/:nit': 'buscarApoderado',
                'buscar_poderdante/:nit': 'buscarPoderdante',
                'rechazar': 'rechazar',
                'masivo': 'masivo',
                'error': 'error'
            },
            ...options,
        });

        this.controller = $App.startSubApplication(PoderesController, this);
        this._bindRoutes();
    }

    error() {
        console.log('RouterPoderes.error() called');
        this.controller.error();
    }

    listar() {
        console.log('RouterPoderes.listar() called');
        this.controller.listar();
    }

    buscar() {
        console.log('RouterPoderes.buscar() called');
        this.controller.buscar();
    }

    crear() {
        console.log('RouterPoderes.crear() called');
        this.controller.crear();
    }

    mostrar(documento: string) {
        console.log('RouterPoderes.mostrar() called', documento);
        this.controller.mostrar(documento);
    }

    buscarApoderado(nit: string) {
        console.log('RouterPoderes.buscarApoderado() called', nit);
        this.controller.buscarApoderado(nit);
    }

    buscarPoderdante(nit: string) {
        console.log('RouterPoderes.buscarPoderdante() called', nit);
        this.controller.buscarPoderdante(nit);
    }

    rechazar() {
        console.log('RouterPoderes.rechazar() called');
        this.controller.rechazar();
    }

    masivo() {
        console.log('RouterPoderes.masivo() called');
        this.controller.masivo();
    }
}

export default RouterPoderes;
