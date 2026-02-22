import tmp_detalle_empresa from "@/componentes/habiles/templates/detalle_empresa.hbs?raw";
import { ModelView } from "@/common/ModelView";
import EmpresaService from "@/pages/Habiles/EmpresaService";

interface EmpresaDetalleViewOptions {
    model?: any;
    collection?: any;
    EmpresaModel: new (attrs?: any, options?: any) => any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

export default class EmpresaDetalleView extends ModelView {
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    empresaService: EmpresaService;

    constructor(options: EmpresaDetalleViewOptions) {
        super({
            ...options,
            className: 'box',
        });
        this.modelUse = options.EmpresaModel;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(tmp_detalle_empresa);

        // Inicializar el servicio con las dependencias
        this.empresaService = new EmpresaService({
            api: this.api,
            App: this.app,
            logger: this.logger
        });
    }
}
