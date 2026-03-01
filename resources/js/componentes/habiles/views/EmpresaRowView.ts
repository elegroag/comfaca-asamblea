import tmp_row_empresa from '../templates/row_empresa.hbs?raw';
import { BackboneView } from '@/common/Bone';

interface EmpresaRowViewOptions {
    model?: any;
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

export default class EmpresaRowView extends BackboneView {
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;

    constructor(options: EmpresaRowViewOptions = {}) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
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

    render() {
        const data = this.model ? this.model.toJSON() : {};
        const renderedHtml = this.template(data);
        this.$el.html(renderedHtml);
        return this;
    }
}
