import LayoutView from "@/componentes/layouts/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadorMostrarView from "@/componentes/trabajadores/views/TrabajadorMostrarView";
import TrabajadorService from "./TrabajadorService";
import { Controller } from "@/common/Controller";
import { CommonDeps } from "@/types/CommonDeps";

interface TrabajadorMostrarOptions extends CommonDeps {
    [key: string]: any;
}

export default class TrabajadorMostrar extends Controller {
    private trabajadorService: TrabajadorService;

    constructor(options: TrabajadorMostrarOptions) {
        super(options);
        this.trabajadorService = new TrabajadorService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    mostrarTrabajador(model: any): void {
        try {
            const layout = new LayoutView();
            this.region.show(layout);

            const subheaderRegion = layout.getRegion('subheader');
            if (subheaderRegion) {
                subheaderRegion.show(
                    new TrabajadoresNav({
                        model: {
                            titulo: 'Mostrar trabajador',
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
                const view = new TrabajadorMostrarView({
                    model: model,
                    App: this.App,
                    api: this.api,
                    logger: this.logger,
                    region: this.region,
                });
                bodyRegion.show(view);
                (TrabajadoresNav as any).parentView = view;
            }

        } catch (error: any) {
            this.logger?.error('Error al mostrar trabajador:', error);
            this.App?.trigger('alert:error', error.message || 'Error al mostrar trabajador');
        }
    }

    destroy(): void {
        this.region.remove();
        if (this.stopListening) this.stopListening();
    }
}
