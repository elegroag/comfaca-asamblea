
import { BackboneView } from "@/common/Bone";
import tmp_rechazo_detalle from "@/templates/recepcion/rechazo_detalle.hbs?raw";

export default class RechazoEmpresaView extends BackboneView {
    template!: string;

    constructor(options: any) {
        super(options);
    }

    initialize(options: any) {
        this.template = tmp_rechazo_detalle;
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
        $App.trigger('hide:modal', this);
    }
}
