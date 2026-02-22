import RechazoDetalleView from "@/componentes/rechazos/views/RechazoDetalleView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "./RechazoService";
import LayoutView from "@/componentes/layouts/views/LayoutView";
import { Controller } from "@/common/Controller";
import ApiService from "@/services/ApiService";
import type { AppInstance } from "@/types/types";
import type { Region } from "@/common/Region";

interface RechazoDetalleOptions {
    [key: string]: any;
    region: Region;
    logger: any;
    router: any;
    api: ApiService;
    app: AppInstance;
}

export default class RechazoDetalle extends Controller {
    rechazoService: RechazoService;

    constructor(options: RechazoDetalleOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.router = options.router;
        this.app = options.app;
        _.extend(this, options);

        this.rechazoService = new RechazoService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
        this.listenTo(this, 'set:rechazos', this.rechazoService.setRechazos);
        this.listenTo(this, 'add:rechazos', this.rechazoService.addRechazos);
        this.rechazoService.__findAll();
    }

    async showDetalle(model: any): Promise<void> {
        try {
            const layout = new LayoutView();
            this.region.show(layout);

            const regionSubheader = layout.getRegion('subheader');
            if (regionSubheader) {
                regionSubheader.show(
                    new RechazosNav({
                        model: {
                            titulo: 'Detalle Rechazo',
                            listar: true,
                            exportar: false,
                            crear: true,
                            editar: true,
                            masivo: true,
                        },
                    })
                );
            }

            const rechazos = await this.rechazoService.__findAll();

            const view = new RechazoDetalleView({
                collection: rechazos,
                model: model,
            });

            this.listenTo(view, 'form:save', this.rechazoService.saveRechazo);
            this.listenTo(view, 'add:notify', this.rechazoService.notifyPlataforma);
            const regionBody = layout.getRegion('body');
            if (regionBody) {
                regionBody.show(view);
            }
            (RechazosNav as any).parentView = view;
        } catch (error: any) {
            this.logger?.error('Error en showDetalle:', error);
            this.app?.trigger('alert:error', error.message);
        }
    }

    destroy(): void {
        this.region.remove();
        this.stopListening();
    }
}
