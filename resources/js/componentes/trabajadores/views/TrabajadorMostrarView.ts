import { BackboneView } from "@/common/Bone";
import TrabajadorService from "@/pages/Trabajadores/TrabajadorService";
import mostrar from "@/componentes/trabajadores/templates/mostrar.hbs?raw";

interface TrabajadorMostrarViewOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class TrabajadorMostrarView extends BackboneView {
    model: any;
    trabajador: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    trabajadorService: TrabajadorService;

    constructor(options: TrabajadorMostrarViewOptions) {
        super({
            ...options,
            id: 'box_mostrar_trabajadores',
            className: 'box',
            trabajador: undefined
        });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.trabajadorService = new TrabajadorService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    initialize() {
        this.render();
    }

    render() {
        const template = _.template(mostrar);
        this.trabajador = this.model;
        this.$el.html(template(this.trabajador));
        return this;
    }
}
