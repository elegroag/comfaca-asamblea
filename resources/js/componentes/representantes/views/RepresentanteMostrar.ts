import { BackboneView } from "@/common/Bone";
import RepresentanteService from "@/pages/Representantes/RepresentanteService";
import mostrar from "@/componentes/representantes/templates/mostrar.hbs?raw";

interface RepresentanteMostrarOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RepresentanteMostrar extends BackboneView {
    template: any;
    model: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    representanteService: RepresentanteService;
    subNavView: any;

    constructor(options: RepresentanteMostrarOptions) {
        super({
            ...options,
            id: 'box_mostrar_representante',
        });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(mostrar);
        this.representanteService = new RepresentanteService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    initialize() {
        // Template ya inicializado en el constructor
    }

    events() {
        return {};
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(
            template({
                representante: this.model.toJSON(),
            })
        );
        this.subNav();
        return this;
    }

    subNav() {
        // Implementación básica de subNav sin dependencias externas
        this.$el.find('#showSubnav').html('<div class="subnav-placeholder"></div>');
    }
}
