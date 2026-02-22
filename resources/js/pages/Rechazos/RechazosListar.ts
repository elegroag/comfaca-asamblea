import LayoutView from "@/componentes/layouts/views/LayoutView";
import RechazoListarView from "@/componentes/rechazos/views/RechazoListarView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "./RechazoService";
import { Controller } from "@/common/Controller";
import { CommonDeps } from "@/types/CommonDeps";

interface RechazosListarOptions extends CommonDeps {
    [key: string]: any;
}

export default class RechazosListar extends Controller {
    private rechazoService: RechazoService;

    constructor(options: RechazosListarOptions) {
        super(options);
        this.rechazoService = new RechazoService({
            api: options.api,
            logger: options.logger,
            app: options.app
        });
    }

    async listaRechazos(): Promise<void> {
        try {
            await this.rechazoService.__findAll();
            this.renderLista();
        } catch (error: any) {
            this.logger?.error('Error al listar rechazos:', error);
            this.app?.trigger('alert:error', error.message || 'Error al cargar rechazos');
        }
    }

    private renderLista(): void {
        const layoutInstance = new LayoutView();
        this.region.show(layoutInstance);

        const view = new RechazoListarView({
            collection: (this.rechazoService as any).collections.rechazos,
            app: this.app,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.listenTo(view, 'remove:rechazos', this.rechazoService.__removeRechazo.bind(this.rechazoService));
        if (layoutInstance) {
            const bodyRegion = layoutInstance.getRegion('body');
            bodyRegion?.show(view);

            const subheaderRegion = layoutInstance.getRegion('subheader');
            subheaderRegion?.show(
                new RechazosNav({
                    model: {
                        titulo: 'Listar rechazos empresas Asamblea',
                        listar: false,
                        exportar: true,
                        crear: true,
                        editar: false,
                        masivo: true,
                        dataToggle: 'rechazos'
                    },
                    app: this.app,
                    api: this.api,
                    logger: this.logger,
                    region: this.region,
                })
            );
        }
    }

    destroy(): void {
        this.region.remove();
        this.stopListening();
    }
}
