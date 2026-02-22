import { ModelView } from "@/common/ModelView";
import tmp_row_rechazo from "@/componentes/rechazos/templates/row_rechazo.hbs?raw";

interface RechazoRowViewOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazoRowView extends ModelView {
    template: string;
    model: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;

    constructor(options: RechazoRowViewOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = tmp_row_rechazo;
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: RechazoRowViewOptions = {}) {
        this.listenTo(options.model, 'change', this.render);
    }
}
