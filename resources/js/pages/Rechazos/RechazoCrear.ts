import LayoutView from "@/componentes/layouts/views/LayoutView";
import RechazoCrearView from "@/componentes/rechazos/views/RechazoCrearView";
import RechazosNav from "@/componentes/rechazos/views/RechazosNav";
import RechazoService from "./RechazoService";
import RechazoModel from "@/componentes/rechazos/models/RechazoModel";
import { Controller } from "@/common/Controller";
import { CommonDeps } from "@/types/CommonDeps";
import { AppInstance } from "@/types/types";
import ApiService from "@/services/ApiService";

interface RechazoCrearOptions extends CommonDeps {
    [key: string]: any;
    app: AppInstance;
    api: ApiService;
    logger: any;
    region: any;
}

export default class RechazoCrear extends Controller {
    private rechazoService: RechazoService;

    constructor(options: RechazoCrearOptions) {
        super(options);
        _.extend(this, options);

        this.rechazoService = new RechazoService({
            api: options.api,
            logger: options.logger,
            app: options.App
        });
    }

    async showCreate(): Promise<void> {
        try {
            const response = await this.rechazoService.__buscarCriterios();
            if (response && response.data) {
                const criterios = response.data;
                const model = new RechazoModel({
                    isNew: true,
                    criterios: criterios,
                });

                this.renderCreate(model);
            }
        } catch (error: any) {
            this.logger?.error('Error al buscar criterios:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar criterios');
        }
    }

    private renderCreate(model: any): void {
        const layoutInstance = new LayoutView();
        this.region.show(layoutInstance);

        const view = new RechazoCrearView({
            collection: (this.rechazoService as any).collections.rechazos,
            model: model,
            app: this.App,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.listenTo(view, 'form:save', this.rechazoService.__saveRechazo.bind(this.rechazoService));
        this.listenTo(view, 'add:notify', this.rechazoService.__notifyPlataforma.bind(this.rechazoService));

        const regionBody = layoutInstance.getRegion('body');

        if (regionBody) {
            regionBody.show(view);
        }

        const regionSubheader = layoutInstance.getRegion('subheader');
        if (regionSubheader) {
            regionSubheader.show(
                new RechazosNav({
                    model: {
                        titulo: 'Crear rechazo',
                        listar: true,
                        exportar: false,
                        crear: false,
                        editar: false,
                        masivo: true,
                        dataToggle: 'rechazos'
                    },
                    app: this.App,
                    api: this.api,
                    logger: this.logger,
                    region: this.region,
                })
            );
        }
    }

    async showEditar(model: any): Promise<void> {
        try {
            // Buscar criterios para edición usando el service
            const response = await this.rechazoService.__buscarCriterios();
            if (response && response.data) {
                const criterios = response.data;
                model.set('criterios', criterios);
                model.set('isNew', false);

                this.renderEditar(model);
            }
        } catch (error: any) {
            this.logger?.error('Error al buscar criterios:', error);
            this.App?.trigger('alert:error', error.message || 'Error al cargar criterios');
        }
    }

    private renderEditar(model: any): void {
        const layout = new LayoutView();
        this.region.show(layout);

        const view = new RechazoCrearView({
            collection: (this.rechazoService as any).collections.rechazos,
            model: model,
            app: this.App,
            api: this.api,
            logger: this.logger,
            region: this.region,
        });

        this.listenTo(view, 'form:editar', this.rechazoService.__actualizarRechazo.bind(this.rechazoService));
        this.listenTo(view, 'add:notify', this.rechazoService.__notifyPlataforma.bind(this.rechazoService));

        const regionBody = layout.getRegion('body');
        if (regionBody) {
            regionBody.show(view);
        }

        const regionSubheader = layout.getRegion('subheader');
        if (regionSubheader) {
            regionSubheader.show(
                new RechazosNav({
                    model: {
                        titulo: 'Editar rechazo',
                        listar: true,
                        exportar: false,
                        crear: false,
                        editar: false,
                        masivo: true,
                        dataToggle: 'rechazos'
                    },
                    app: this.App,
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
