import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import row from "@/componentes/novedades/templates/tmp_row.hbs?raw";

interface NovedadRowOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class NovedadRow extends BackboneView {
    app: AppInstance;
    template: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: NovedadRowOptions) {
        super(options);
        this.app = options.app || options.AppInstance;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(row);
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
