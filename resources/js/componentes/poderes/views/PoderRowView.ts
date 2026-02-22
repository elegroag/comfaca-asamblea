import row_poder from '@/componentes/poderes/templates/rowPoder.hbs?raw';
import { BackboneView } from '@/common/Bone';

interface PoderRowViewOptions {
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class PoderRowView extends BackboneView {
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;

    constructor(options: PoderRowViewOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(row_poder);
    }

    get tagName() {
        return 'tr';
    }

    initialize(options: PoderRowViewOptions = {}) {
        this.listenTo(options.model, 'change', this.render);
    }

    render() {
        const data = this.model ? this.model.toJSON() : {};
        const renderedHtml = this.template(data);
        this.$el.html(renderedHtml);
        return this;
    }
}
