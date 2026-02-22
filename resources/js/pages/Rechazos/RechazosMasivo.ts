import { Controller } from "@/common/Controller";
import LayoutView from "@/componentes/layouts/views/LayoutView";
import RechazoMasivoView from "@/componentes/rechazos/views/RechazoMasivoView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "@/pages/Rechazos/RechazoService";
import ApiService from "@/services/ApiService";
import { AppInstance } from "@/types/types";

interface RechazosMasivoOptions {
    [key: string]: any;
    region: any;
    logger: any;
    router: any;
    api: ApiService;
    app: AppInstance;
}

export default class RechazosMasivo extends Controller {
    rechazoService: RechazoService;

    constructor(options: RechazosMasivoOptions) {
        super(options);

        _.extend(this, options);
        $App.Collections.rechazos = null;
        this.rechazoService = new RechazoService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
        this.listenTo(this, 'set:rechazos', this.rechazoService.setRechazos);
        this.listenTo(this, 'add:rechazos', this.rechazoService.addRechazos);
    }

    cargueMasivo(): void {
        if (!this.app?.Collections.rechazos) this.rechazoService.__findAll();
        const layout = new LayoutView();
        this.region.show(layout);
        const bodyRegion = layout.getRegion('body');


        bodyRegion?.show(new RechazoMasivoView({
            collection: this.app?.Collections.rechazos,
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        }));

        const subheaderRegion = layout.getRegion('subheader');
        subheaderRegion?.show(
            new RechazosNav({
                model: {
                    titulo: 'Cargue de rechazos Asamblea',
                    listar: true,
                    exportar: true,
                    crear: true,
                    editar: false,
                    masivo: false,
                },
            })
        );
    }

    destroy(): void {
        this.region.remove();
        this.stopListening();
    }
}
