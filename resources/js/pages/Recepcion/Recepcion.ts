import LayoutView from "@/componentes/layouts/views/LayoutView";
import { Controller } from "@/common/Controller";
import { getCachedCollection } from "@/componentes/CacheManager";
import RecepcionService from "./RecepcionService";
import AsistenciasCollection from "@/collections/AsistenciasCollection";
import AsistenciasListar from "@/componentes/recepcion/views/AsistenciasListar";

export default class Recepcion extends Controller {

    public recepcionService: RecepcionService;

    constructor(options: any) {
        super(options)
        _.extend(this, options);
        this.recepcionService = new RecepcionService(options);
    }

    listaRecepcion(): void {
        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        const asistencias = getCachedCollection('asistencias', AsistenciasCollection);

        // Configurar vista principal
        const listView = new AsistenciasListar({
            collection: asistencias ?? [], // La vista se actualizará cuando el controller cargue los datos
            router: this.router as any,
            api: this.api,
            app: this.app
        });

        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(listView);
        }
    }

    /**
    * Destruir la vista
    */
    destroy(): void {
        this.region.remove();
        this.stopListening();
    }

}
