import { BackboneView } from "@/common/Bone";

declare global {
    var $: any;
    var _: any;
    var $App: any;
}

interface EmpresaRowViewOptions {
    model?: any;
    collection?: any;
}

export default class EmpresaRowView extends BackboneView {
    template: string;

    constructor(options: EmpresaRowViewOptions = {}) {
        super(options);
        this.template = '#tmp_row_empresa';
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
