
import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import tmp_detalle_cartera from "../templates/tmp_detalle_cartera.hbs?raw";

interface CarteraDetalleOptions {
    model: Cartera;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
}

class CarteraDetalle extends BackboneView {

    constructor(options: CarteraDetalleOptions) {
        super(options);
        this.template = tmp_detalle_cartera;
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #btn_back_list': this.backlist,
        };
    }

    backlist(e: Event): void {
        e.preventDefault();
        this.remove();
        $App.router.navigate('listar', { trigger: true, replace: true });
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
