import { BackboneView } from "@/common/Bone";

import tmp_detalle_empresa from "../templates/detalle_empresa.hbs?raw";

interface EmpresaDetalleViewOptions {
    model?: any;
    collection?: any;
    EmpresaModel: new (attrs?: any, options?: any) => any;
}

export default class EmpresaDetalleView extends BackboneView {

    constructor(options: EmpresaDetalleViewOptions) {
        super({
            ...options,
            className: 'box',
        });
        this.modelUse = options.EmpresaModel;
        this.template = _.template(tmp_detalle_empresa);
    }
}
