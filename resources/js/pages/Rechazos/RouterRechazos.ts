import { BackboneRouter } from "@/common/Bone";
import RechazosController from "./RechazosController";

interface RouterRechazosOptions {
    [key: string]: any;
}

export default class RouterRechazos extends BackboneRouter {
    constructor(options: RouterRechazosOptions = {}) {
        super({
            ...options,
            routes: {
                listar: 'listaRechazos',
                cargue: 'masivoRechazo',
                crear: 'crearRechazo',
                'detalle/:id': 'detailRechazo',
                'edita/:id': 'editaRechazo',
            },
        });
        this._bindRoutes();
    }

    masivoRechazo(): void {
        const app = this.main();
        app.showMasivo();
    }

    listaRechazos(): void {
        const app = this.main();
        app.showList();
    }

    crearRechazo(): void {
        const app = this.main();
        app.showCreate();
    }

    detailRechazo(id: string): void {
        const app = this.main();
        app.showDetalle(id);
    }

    editaRechazo(id: string): void {
        const app = this.main();
        app.showEditar(id);
    }

    main(): any {
        return $App.startSubApplication(RechazosController);
    }
}
