import { BackboneView } from "@/common/Bone";
import tmp_row_empresa from '../templates/row_empresa.hbs?raw';

interface EmpresaRowViewOptions {
    model?: any;
    collection?: any;
}

export default class EmpresaRowView extends BackboneView {

    constructor(options: EmpresaRowViewOptions = {}) {
        super(options);
        this.template = _.template(tmp_row_empresa);
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: EmpresaRowViewOptions): void {
        if (options.model && typeof this.listenTo === 'function') {
            this.listenTo(options.model, 'change', this.render);
        }
    }
}
