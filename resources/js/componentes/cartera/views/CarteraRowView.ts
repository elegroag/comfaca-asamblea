import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import tmp_row_cartera from "../templates/tmp_row_cartera.hbs?raw";

interface CarteraRowViewOptions {
    model: Cartera;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
}

class CarteraRowView extends BackboneView {
    template: string;
    tagName: string;

    constructor(options: CarteraRowViewOptions) {
        super(options);
        this.template = tmp_row_cartera;
        this.tagName = 'tr';
    }

    initialize(options: CarteraRowViewOptions): void {
        this.listenTo(options.model, 'change', this.render);
    }
}

export default CarteraRowView;
