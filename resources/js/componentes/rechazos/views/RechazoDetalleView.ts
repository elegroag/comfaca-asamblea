import { BackboneView } from "@/common/Bone";
import tmp_detalle_rechazo from '../templates/tmp_detalle_rechazo.hbs?raw';
import { ModelView } from "@/common/ModelView";

interface RechazoDetalleViewOptions {
    [key: string]: any;
}

export default class RechazoDetalleView extends ModelView {
    subNavView: any;
    template!: any;

    constructor(options: RechazoDetalleViewOptions) {
        super(options);
        this.template = _.template(tmp_detalle_rechazo);
    }
}
