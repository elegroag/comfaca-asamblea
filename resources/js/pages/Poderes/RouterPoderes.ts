import { BackboneRouter } from "@/common/Bone";
import PoderesController from "./PoderesController";
import $App from "@/core/App";

class RouterPoderes extends BackboneRouter {
    controller: PoderesController | null = null;

    constructor(options: any) {
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

        this._bindRoutes();
    }

    init() {
        this.controller = $App.startSubApplication(PoderesController);
    }

    error() {
        this.init();
        console.log('RouterPoderes.error() called');
        this.controller?.error();
    }

    listar() {
        this.init();
        console.log('RouterPoderes.listar() called');
        this.controller?.listar();
    }

    buscar() {
        this.init();
        console.log('RouterPoderes.buscar() called');
        this.controller?.buscar();
    }

    crear() {
        this.init();
        console.log('RouterPoderes.crear() called');
        this.controller?.crear();
    }

    mostrar(documento: string) {
        this.init();
        console.log('RouterPoderes.mostrar() called', documento);
        this.controller?.mostrar(documento);
    }

    buscarApoderado(nit: string) {
        this.init();
        console.log('RouterPoderes.buscarApoderado() called', nit);
        this.controller?.buscarApoderado(nit);
    }

    buscarPoderdante(nit: string) {
        this.init();
        console.log('RouterPoderes.buscarPoderdante() called', nit);
        this.controller?.buscarPoderdante(nit);
    }

    rechazar() {
        this.init();
        console.log('RouterPoderes.rechazar() called');
        this.controller?.rechazar();
    }

    masivo() {
        this.init();
        console.log('RouterPoderes.masivo() called');
        this.controller?.masivo();
    }
}

export default RouterPoderes;
