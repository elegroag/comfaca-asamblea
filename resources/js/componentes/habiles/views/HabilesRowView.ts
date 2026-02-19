import { BackboneView } from "@/common/Bone";

declare global {
    var $: any;
    var _: any;
    var $App: any;
}

interface HabilesRowViewOptions {
    model?: any;
    collection?: any;
}

export default class HabilesRowView extends BackboneView {
    template: string;

    constructor(options: HabilesRowViewOptions = {}) {
        super(options);
        this.template = '#tmp_row_habil';
    }

    get tagName(): string {
        return 'tr';
    }

    initialize(options: HabilesRowViewOptions): void {
        if (options.model && typeof this.listenTo === 'function') {
            this.listenTo(options.model, 'change', this.render);
        }
    }
}
