import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';

declare global {
    var _: any;
}

interface NovedadRowOptions {
    model?: any;
    App?: AppInstance;
    [key: string]: any;
}

export default class NovedadRow extends BackboneView {
    App: AppInstance;
    template: string;

    constructor(options: NovedadRowOptions = {}) {
        super(options);
        this.App = options.App || options.AppInstance;
        this.template = '#tmp_row';
    }

    get tagName() {
        return 'tr';
    }

    initialize(options: NovedadRowOptions = {}): void {
        this.listenTo(options.model, 'change', this.render);
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template({ novedad: this.model.toJSON() }));
        return this;
    }
}
