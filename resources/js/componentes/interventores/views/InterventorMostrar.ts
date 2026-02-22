import { BackboneView } from "@/common/Bone";
import InterventorService from "@/pages/Interventores/InterventorService";
import mostrar from "@/componentes/interventores/templates/mostrar.hbs?raw";

interface InterventorMostrarOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class InterventorMostrar extends BackboneView {
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    interventor: any;
    interventorService: InterventorService;

    constructor(options: InterventorMostrarOptions = {}) {
        super({
            ...options,
            tagName: 'div',
            id: 'box_mostrar_interventores',
            className: 'box',
            interventor: undefined
        });
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(mostrar);
        this.interventorService = new InterventorService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(): void {
        this.render();
    }

    get events() {
        return {};
    }

    render(): this {
        const template = _.template(this.template);
        this.interventor = this.model;
        const interventorData = this.interventor ? this.interventor.toJSON() : {};
        this.$el.html(template(interventorData));
        return this;
    }
}
