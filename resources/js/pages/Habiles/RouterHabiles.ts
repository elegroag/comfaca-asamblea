import { BackboneRouter } from "@/common/Bone";
import EmpresasController from "./EmpresasController";
import type { AppInstance } from "@/types/types";
import { RouterHabilesOptions } from "./types";


export default class RouterHabiles extends BackboneRouter {
    public controller: EmpresasController | null;
    private app: AppInstance;

    constructor(options: RouterHabilesOptions) {
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
        this.controller = null;
        this._bindRoutes();
    }

    init() {
        this.controller = this.app.startSubApplication(EmpresasController);
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
        this.init();
        this.controller?.cargueMasivo();
    }

    /**
     * Manejar ruta para listar empresas
     */
    listaEmpresas(): void {
        this.init();
        this.controller?.listaEmpresas();
    }

    /**
     * Manejar ruta para ver detalles de empresa
     */
    detalleEmpresa(nit: string): void {
        this.init();
        if (!nit || nit.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        this.controller?.detalleEmpresa(nit);
    }

    /**
     * Manejar ruta para crear nueva empresa
     */
    crearEmpresa(): void {
        this.init();
        this.controller?.crearEmpresa();
    }

    /**
     * Manejar ruta para editar empresa
     */
    editaEmpresa(nit: string): void {
        this.init();
        if (!nit || nit.trim() === '') {
            this.navigate('listar', { trigger: true });
            return;
        }

        this.controller?.editaEmpresa(nit);
    }

    /**
     * Manejar ruta para listar habiles
     */
    listarHabiles(): void {
        this.init();
        this.controller?.listarHabiles();
    }
}
