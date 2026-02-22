import tmp_row_empresa from '../templates/row_empresa.hbs?raw';
import EmpresaService from "@/pages/Habiles/EmpresaService";
import { ModelView } from "@/common/ModelView";

interface EmpresaRowViewOptions {
    model?: any;
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

export default class EmpresaRowView extends ModelView {
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    empresaService: EmpresaService;

    constructor(options: EmpresaRowViewOptions = {}) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_row_empresa);

        // Inicializar el servicio con las dependencias
        this.empresaService = new EmpresaService({
            api: this.api,
            App: this.app,
            logger: this.logger
        });
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: EmpresaRowViewOptions): void {
        if (options.model && typeof this.listenTo === 'function') {
            this.listenTo(options.model, 'change', this.render);
        }
    }
}
