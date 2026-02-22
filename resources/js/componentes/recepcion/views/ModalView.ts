import { BackboneView } from "@/common/Bone";

interface ModalViewOptions {
    model?: any;
    App?: any;
    [key: string]: any;
}

export default class ModalView extends BackboneView {
    template!: string;
    App: any;

    constructor(options: ModalViewOptions = {}) {
        super({ ...options, tagName: 'div', id: 'mymodal', className: 'modal fade' });
        this.App = options.App;
    }

    remover() {
        if (this.model.data.has_voto_disponible == -1) {
            $('[name="nit_poder"]').val('');
            $("[name='check_dispone_poder']").trigger('click');
        }
        this.remove();
    }

    active_close(e: Event) {
        e.preventDefault();
        if (this.model.data.has_voto_disponible == -1) {
            $('[name="nit_poder"]').val('');
        }
        this.$el.modal('hide');
    }

    aplicarPoder(e: Event) {
        e.preventDefault();
        var empresa = this.model.data.empresa;
        $('[name="nit_poder"]').val('');
        $('#card_poder').fadeIn('slow');
        $("[name='check_dispone_poder']").trigger('click');
        let template = _.template($('#tmp_poder').html());
        $('#data_content_poder').html(template(empresa));

        var votos = this.model.votos;
        votos = empresa.has_voto_disponible != -1 ? 1 + votos : votos;
        $('#num_votos_admitidos').text(votos);
        this.$el.modal('hide');
    }

    events() {
        return {
            'hidden.bs.modal': 'remover',
            'click .btn-close': 'active_close',
            'click #aplicar_poder': 'aplicarPoder',
        };
    }

    render() {
        this.attributes = {
            'data-bs-backdrop': 'static',
            'data-bs-keyboard': 'false',
            tabindex: '-1',
            'aria-hidden': 'true',
        };
        let template = _.template($('#tmp_modal').html());
        this.$el.html(template(this.model));
        this.$el.modal('show');
        return this;
    }
}
