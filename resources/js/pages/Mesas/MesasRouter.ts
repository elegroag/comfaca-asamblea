import { BackboneRouter } from "@/common/Bone";
import MesasController from "./MesasController";
import { RouterOptions } from "@/types/CommonDeps";

export default class MesasRouter extends BackboneRouter {
    private controller: MesasController | null = null;

    constructor(options: RouterOptions = {}) {
        super({
            routes: {
                listar: 'listarMesas',
                crear: 'crearMesa',
                listar_comfaca: 'listarMesas',
                'editar/:id': 'editaMesa',
                'mostrar/:mesa': 'mostrarMesas',
            },
            ...options,
        });


        this.controller = null;
        this._bindRoutes();
    }

    init() {
        this.controller = this.app.startSubApplication(MesasController);
    }

    listarMesas(): void {
        this.init();
        this.controller?.listarMesas();
    }

    crearMesa(): void {
        this.init();
        this.controller?.crearMesa();
    }

    editaMesa(id: string): void {
        this.init();
        this.controller?.editarMesa(id);
    }

    mostrarMesas(mesa: string): void {
        this.init();
        this.controller?.mostrarMesa(mesa);
    }
}
