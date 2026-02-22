import { BackboneView } from "@/common/Bone";
import tmp_rechazo_detalle from "@/templates/recepcion/rechazo_detalle.hbs?raw";

interface RechazoEmpresaViewOptions {
    model?: any;
    collection?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazoEmpresaView extends BackboneView {
    template!: string;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: RechazoEmpresaViewOptions) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
    }

    initialize(options: any) {
        // Template ya inicializado en el constructor
    }

    events() {
        return {
            'click #bt_close': 'closeModal',
        };
    }

    render() {
        const _template = _.template(this.template);
        this.$el.html(
            _template({
                empresa: this.model?.toJSON() || {},
                rechazos: this.collection || [],
            })
        );
        return this;
    }

    closeModal(e: JQuery.Event) {
        e.preventDefault();
        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('hide:modal', this);
        }
    }
}
