import { BackboneView } from "@/common/Bone";
import tmp_row_habil from '../templates/row_habil.hbs?raw';

interface HabilesRowViewOptions {
    model?: any;
    collection?: any;
}

export default class HabilesRowView extends BackboneView {

    constructor(options: HabilesRowViewOptions = {}) {
        super(options);
        this.template = _.template(tmp_row_habil);
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
