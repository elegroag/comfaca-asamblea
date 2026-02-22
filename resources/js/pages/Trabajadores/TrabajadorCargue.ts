import LayoutView from "@/componentes/layouts/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadorCargueView from "@/componentes/trabajadores/views/TrabajadorCargueView";
import TrabajadorService from "./TrabajadorService";
import { Controller } from "@/common/Controller";
import { CommonDeps } from "@/types/CommonDeps";

interface TrabajadorCargueOptions extends CommonDeps {
    [key: string]: any;
}

export default class TrabajadorCargue extends Controller {
    private trabajadorService: TrabajadorService;

    constructor(options: TrabajadorCargueOptions) {
        super(options);
        this.trabajadorService = new TrabajadorService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    cargueTrabajador(): void {
        try {
            const layout = new LayoutView();
            this.region.show(layout);

            const subheaderRegion = layout.getRegion('subheader');
            if (subheaderRegion) {
                subheaderRegion.show(
                    new TrabajadoresNav({
                        model: {
                            titulo: 'Cargue de trabajadores',
                            listar: false,
                            exportar: false,
                            crear: false,
                            editar: false,
                            masivo: false,
                            dataToggle: 'dropdown'
                        },
                    })
                );
            }

            const bodyRegion = layout.getRegion('body');
            if (bodyRegion) {
                const view = new TrabajadorCargueView({
                    collection: (this.app as any).Collections.trabajadores,
                    app: this.app,
                    api: this.api,
                    logger: this.logger,
                    region: this.region,
                });
                bodyRegion.show(view);
            }

        } catch (error: any) {
            this.logger?.error('Error al cargar trabajadores:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar trabajadores');
        }
    }

    destroy(): void {
        this.region.remove();
        this.stopListening();
    }
}
