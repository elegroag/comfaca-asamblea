import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import tmp_row_cartera from "@/componentes/cartera/templates/tmp_row_cartera.hbs?raw";
import CarteraService from "@/pages/Cartera/CarteraService";

interface CarteraRowViewOptions {
    model: Cartera;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

class CarteraRowView extends BackboneView {
    template: string;
    tagName: string;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    carteraService: CarteraService;

    constructor(options: CarteraRowViewOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = tmp_row_cartera;
        this.tagName = 'tr';

        // Inicializar el servicio con las dependencias
        this.carteraService = new CarteraService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(options: CarteraRowViewOptions): void {
        this.listenTo(options.model, 'change', this.render);
    }
}

export default CarteraRowView;
