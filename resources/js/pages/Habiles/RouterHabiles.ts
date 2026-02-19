import { BackboneRouter } from "@/common/Bone";
import EmpresasController from "./EmpresasController";

declare global {
    var $: any;
    var _: any;
    var $App: any;
}

interface RouterHabilesOptions {
    routes?: Record<string, string>;
    [key: string]: any;
}

export default class RouterHabiles extends BackboneRouter {
    public controller: EmpresasController;

    constructor(options: RouterHabilesOptions = {}) {
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

        this.controller = $App.startSubApplication(EmpresasController, this);
        this._bindRoutes();
    }

    /**
     * Método principal del router
     */
    main(): void {
        console.log('RouterHabiles.main() called');
    }

    /**
     * Manejar ruta para cargue masivo de empresas
     */
    masivoEmpresas(): void {
        console.log('RouterHabiles.masivoEmpresas() called');
        this.controller.cargueMasivo();
    }

    /**
     * Manejar ruta para listar empresas
     */
    listaEmpresas(): void {
        console.log('RouterHabiles.listaEmpresas() called');
        this.controller.listaEmpresas();
    }

    /**
     * Manejar ruta para ver detalles de empresa
     */
    detalleEmpresa(nit: string): void {
        console.log('RouterHabiles.detalleEmpresa() called', nit);

        if (!nit || nit.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        this.controller.detalleEmpresa(nit);
    }

    /**
     * Manejar ruta para crear nueva empresa
     */
    crearEmpresa(): void {
        console.log('RouterHabiles.crearEmpresa() called');
        this.controller.crearEmpresa();
    }

    /**
     * Manejar ruta para editar empresa
     */
    editaEmpresa(nit: string): void {
        console.log('RouterHabiles.editaEmpresa() called', nit);

        if (!nit || nit.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        this.controller.editaEmpresa(nit);
    }

    /**
     * Manejar ruta para listar habiles
     */
    listarHabiles(): void {
        console.log('RouterHabiles.listarHabiles() called');
        this.controller.listarHabiles();
    }
}
