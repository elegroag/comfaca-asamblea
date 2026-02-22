import tmp_detalle_rechazo from '../templates/tmp_detalle_rechazo.hbs?raw';
import { ModelView } from "@/common/ModelView";

interface RechazoDetalleViewOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazoDetalleView extends ModelView {
    subNavView: any;
    template!: any;
    model: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;

    constructor(options: RechazoDetalleViewOptions) {
        super(options);
        this.model = options.model;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_detalle_rechazo);
    }
}
