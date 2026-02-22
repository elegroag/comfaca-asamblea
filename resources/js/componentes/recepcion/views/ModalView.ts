import { BackboneView } from "@/common/Bone";

interface ModalViewOptions {
    model?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ModalView extends BackboneView {
    template!: string;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: ModalViewOptions = {}) {
        super({ ...options, tagName: 'div', id: 'mymodal', className: 'modal fade' });
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
    }

    remover() {
        if (this.model.data.has_voto_disponible == -1) {
            // Limpiar campos de poder
            const nitPoderInput = document.querySelector('[name="nit_poder"]') as HTMLInputElement;
            if (nitPoderInput) {
                nitPoderInput.value = '';
            }
            const checkDisponePoder = document.querySelector('[name="check_dispone_poder"]') as HTMLInputElement;
            if (checkDisponePoder) {
                checkDisponePoder.click();
            }
        }
        this.remove();
    }

    active_close(e: Event) {
        e.preventDefault();
        if (this.model.data.has_voto_disponible == -1) {
            const nitPoderInput = document.querySelector('[name="nit_poder"]') as HTMLInputElement;
            if (nitPoderInput) {
                nitPoderInput.value = '';
            }
        }
        this.$el.modal('hide');
    }

    aplicarPoder(e: Event) {
        e.preventDefault();
        const empresa = this.model.data.empresa;

        // Limpiar campo de poder
        const nitPoderInput = document.querySelector('[name="nit_poder"]') as HTMLInputElement;
        if (nitPoderInput) {
            nitPoderInput.value = '';
        }

        // Mostrar card de poder
        const cardPoder = document.getElementById('card_poder');
        if (cardPoder) {
            cardPoder.style.display = 'block';
        }

        // Activar checkbox
        const checkDisponePoder = document.querySelector('[name="check_dispone_poder"]') as HTMLInputElement;
        if (checkDisponePoder) {
            checkDisponePoder.click();
        }

        // Renderizar template de poder
        const poderTemplate = document.getElementById('tmp_poder');
        const dataContentPoder = document.getElementById('data_content_poder');
        if (poderTemplate && dataContentPoder) {
            const template = _.template(poderTemplate.textContent || '');
            dataContentPoder.innerHTML = template(empresa);
        }

        // Actualizar votos
        const votos = this.model.votos;
        const votosActualizados = empresa.has_voto_disponible != -1 ? 1 + votos : votos;
        const numVotosElement = document.getElementById('num_votos_admitidos');
        if (numVotosElement) {
            numVotosElement.textContent = votosActualizados.toString();
        }

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

        // Renderizar template del modal
        const modalTemplate = document.getElementById('tmp_modal');
        if (modalTemplate) {
            const template = _.template(modalTemplate.textContent || '');
            this.$el.html(template(this.model));
        }

        this.$el.modal('show');
        return this;
    }
}
