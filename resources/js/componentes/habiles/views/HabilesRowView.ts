import { BackboneView } from "@/common/Bone";
import tmp_row_habil from '../templates/row_habil.hbs?raw';
import HabilesService from "@/pages/Habiles/EmpresaService";

interface HabilesRowViewOptions {
    model?: any;
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

export default class HabilesRowView extends BackboneView {
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    habilesService: HabilesService;

    constructor(options: HabilesRowViewOptions = {}) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_row_habil);

        // Inicializar el servicio con las dependencias
        this.habilesService = new HabilesService({
            api: this.api,
            app: this.app,
            logger: this.logger
        });
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: HabilesRowViewOptions): void {
        if (options.model && typeof this.listenTo === 'function') {
            this.listenTo(options.model, 'change', this.render);
        }
    }
}
