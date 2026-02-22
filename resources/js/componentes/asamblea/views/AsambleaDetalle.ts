import { BackboneView } from "@/common/Bone";
import detalle from "@/componentes/asamblea/templates/detalle.hbs?raw";

interface AsambleaDetalleOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsambleaDetalle extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: AsambleaDetalleOptions = {}) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(detalle);
    }

    initialize(): void {
        // Template ya asignado en el constructor
    }

    render(): this {
        const template = _.template(this.template);
        const asambleaData = this.model ? this.model.toJSON() : {};
        this.$el.html(template({ asamblea: asambleaData }));
        return this;
    }

    get events() {
        return {
            'click #bt_back': this.back,
        };
    }

    /**
     * Volver a la vista de listado
     */
    back(): void {
        this.remove();
        if (this.App && this.App.router) {
            this.App.router.navigate('listar_asambleas', { trigger: true, replace: true });
        }
    }
}
