import { BackboneView } from "@/common/Bone";
import RepresentanteService from "@/pages/Representantes/RepresentanteService";
import row from "@/componentes/representantes/templates/tmp_row.hbs?raw";

interface RepresentanteRowOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RepresentanteRow extends BackboneView {
    template: any;
    model: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    representanteService: RepresentanteService;

    constructor(options: RepresentanteRowOptions) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(row);
        this.representanteService = new RepresentanteService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: RepresentanteRowOptions) {
        this.listenTo(options.model, 'change', this.render);
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template(this.model.toJSON()));
        return this;
    }
}
