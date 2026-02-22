import LayoutView from "@/componentes/layouts/views/LayoutView";
import TrabajadoresNav from "@/componentes/trabajadores/views/TrabajadoresNav";
import TrabajadorCrearView from "@/componentes/trabajadores/views/TrabajadorCrearView";
import Trabajador from "@/componentes/trabajadores/models/Trabajador";
import TrabajadorService from "./TrabajadorService";
import { Controller } from "@/common/Controller";
import { CommonDeps } from "@/types/CommonDeps";

interface TrabajadorCrearOptions extends CommonDeps {
    [key: string]: any;
}

export default class TrabajadorCrear extends Controller {
    private trabajadorService: TrabajadorService;

    constructor(options: TrabajadorCrearOptions) {
        super(options);
        this.trabajadorService = new TrabajadorService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    /**
     * Crear trabajador
     */
    crearTrabajador(): void {
        try {
            const layout = new LayoutView();
            this.region.show(layout);

            const subheaderRegion = layout.getRegion('subheader');
            if (subheaderRegion) {
                subheaderRegion.show(
                    new TrabajadoresNav({
                        model: {
                            titulo: 'Crear trabajador',
                            listar: false,
                            exportar: false,
                            crear: false,
                            editar: false,
                            masivo: false,
                            dataToggle: 'dropdown'
                        },
                        api: this.api,
                        logger: this.logger,
                        app: this.App
                    })
                );
            }

            const bodyRegion = layout.getRegion('body');
            if (bodyRegion) {
                const view = new TrabajadorCrearView({
                    model: new Trabajador({ isNew: true }),
                    collection: (this.App as any).Collections.trabajadores,
                    app: this.app,
                    api: this.api,
                    logger: this.logger,
                    region: this.region,
                });

                bodyRegion.show(view);

                // Conectar eventos con el servicio
                this.listenTo(view, 'remove:trabajador', this.trabajadorService.__removeTrabajador.bind(this.trabajadorService));
                this.listenTo(view, 'form:save', this.trabajadorService.__saveTrabajador.bind(this.trabajadorService));

                (TrabajadoresNav as any).parentView = view;
            }

        } catch (error: any) {
            this.logger?.error('Error al crear trabajador:', error);
            this.App?.trigger('alert:error', error.message || 'Error al crear trabajador');
        }
    }

    destroy(): void {
        this.region.remove();
        this.stopListening();
    }
}
