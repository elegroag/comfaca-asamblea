import { BackboneRouter } from "@/common/Bone";
import EmpresasController from "./EmpresasController";
import { RouterOptions } from "@/types/CommonDeps";

export default class RouterHabiles extends BackboneRouter {


    constructor(options: RouterOptions) {
        super({
            ...options,
            routes: {
                listar: 'listaEmpresas',
                masivo: 'masivoEmpresas',
                'detalle/:nit': 'detalleEmpresa',
                crear: 'crearEmpresa',
                'edita/:nit': 'editaEmpresa',
                habiles: 'listarHabiles',
            },
        });

        this.app = options.app;
        this._bindRoutes();
    }

    init(): EmpresasController {
        return this.app.startSubApplication(EmpresasController);
    }

    /**
     * Manejar ruta para cargue masivo de empresas
     */
    masivoEmpresas(): void {
        const controller = this.init();
        controller.cargueMasivo();
    }

    /**
     * Manejar ruta para listar empresas
     */
    listaEmpresas(): void {
        const controller = this.init();
        controller.listaEmpresas();
    }

    /**
     * Manejar ruta para ver detalles de empresa
     */
    detalleEmpresa(nit: string): void {
        const controller = this.init();
        if (!nit || nit.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        controller.detalleEmpresa(nit);
    }

    /**
     * Manejar ruta para crear nueva empresa
     */
    crearEmpresa(): void {
        const controller = this.init();
        controller.crearEmpresa();
    }

    /**
     * Manejar ruta para editar empresa
     */
    editaEmpresa(nit: string): void {
        const controller = this.init();
        if (!nit || nit.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        controller.editaEmpresa(nit);
    }

    /**
     * Manejar ruta para listar habiles
     */
    listarHabiles(): void {
        const controller = this.init();
        controller.listarHabiles();
    }
}
