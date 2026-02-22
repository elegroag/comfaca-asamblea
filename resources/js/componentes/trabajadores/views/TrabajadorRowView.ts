import { BackboneView } from "@/common/Bone";
import TrabajadorService from "@/pages/Trabajadores/TrabajadorService";
import row from "@/componentes/trabajadores/templates/tmp_row_trabajador.hbs?raw";

interface TrabajadorRowViewOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class TrabajadorRowView extends BackboneView {
    template: any;
    model: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    trabajadorService: TrabajadorService;

    constructor(options: TrabajadorRowViewOptions) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(row);
        this.trabajadorService = new TrabajadorService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: TrabajadorRowViewOptions) {
        this.listenTo(options.model, 'change', this.render);
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template(this.model.toJSON()));
        return this;
    }
}
