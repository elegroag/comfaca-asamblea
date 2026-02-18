'use strict';

import row_poder from '@/componentes/poderes/templates/rowPoder.hbs?raw';
import { ModelView } from '@/common/ModelView';

export default class PoderRowView extends ModelView {
    constructor(options: any) {
        super(options);
        this.template = _.template(row_poder);
    }

    get tagName() {
        return 'tr';
    }

    initialize(options: any) {
        this.listenTo(options.model, 'change', this.render);
    }
}
