
import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import tmp_detalle_cartera from "../templates/tmp_detalle_cartera.hbs?raw";
import CarteraService from "@/pages/Cartera/CarteraService";

interface CarteraDetalleOptions {
    model: Cartera;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

class CarteraDetalle extends BackboneView {
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    carteraService: CarteraService;

    constructor(options: CarteraDetalleOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = tmp_detalle_cartera;

        // Inicializar el servicio con las dependencias
        this.carteraService = new CarteraService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #btn_back_list': this.backlist,
        };
    }

    backlist(e: Event): void {
        e.preventDefault();
        this.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    render(): CarteraDetalle {
        const template = _.template(this.template);
        this.$el.html(
            template({
                cartera: this.model.toJSON(),
            })
        );
        return this;
    }
}

export default CarteraDetalle;
