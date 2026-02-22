import { BackboneView } from "@/common/Bone";
import detalle from "@/componentes/asamblea/templates/detalle.hbs?raw";
import AsambleaService from "@/pages/Asamblea/AsambleaService";

interface AsambleaDetalleOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsambleaDetalle extends BackboneView {
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    asambleaService: AsambleaService;

    constructor(options: AsambleaDetalleOptions = {}) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(detalle);

        // Inicializar el servicio con las dependencias
        this.asambleaService = new AsambleaService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
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
        if (this.app && this.app.router) {
            this.app.router.navigate('listar_asambleas', { trigger: true, replace: true });
        }
    }
}
