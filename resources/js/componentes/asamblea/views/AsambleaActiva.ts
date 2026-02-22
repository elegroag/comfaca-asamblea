import { BackboneView } from "@/common/Bone";
import ConsensoCrear from "./ConsensoCrear";
import ConsensoDetalle from "./ConsensoDetalle";
import activa from "@/componentes/asamblea/templates/activa.hbs?raw";

interface AsambleaActivaOptions {
    model?: any;
    collection?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsambleaActiva extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    consensos: any;
    asambleas: any;
    modal: any;

    constructor(options: AsambleaActivaOptions = {}) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.collection = options.collection;
        this.template = _.template(activa);
        this.consensos = undefined;
        this.asambleas = undefined;
        this.modal = undefined;
    }

    initialize(): void {
        // Template ya asignado en el constructor
        this.consensos = undefined;
        this.asambleas = undefined;
        this.modal = undefined;
    }

    render(): this {
        const template = _.template(this.template);
        this.consensos = this.collection;
        this.$el.html(
            template({
                asamblea: this.model.toJSON(),
                consensos: this.consensos.toJSON(),
            })
        );
        return this;
    }

    get events() {
        return {
            'click #bt_listar_asambleas': this.listar_asambleas,
            'click #bt_nuevo_consenso': this.nuevo_consenso,
            "click [data-toggle='consenso']": this.detalle_consenso,
        };
    }

    /**
     * Crear nuevo consenso
     */
    nuevo_consenso(e: Event): void {
        e.preventDefault();

        if (!this.modal) this.modal = this.$el.find('#notice_modal');
        this.modal.find('#mdl_set_title').text('Crear Consenso');
        this.modal.find('#mdl_set_footer').css('display', 'none');

        const view = new ConsensoCrear({
            App: this.App,
            api: this.api,
            logger: this.logger,
            storage: this.storage,
            region: this.region
        });

        this.modal.find('#mdl_set_body').html(view.render().$el);
        this.modal.modal({ backdrop: 'static', keyboard: true });
        this.modal.show();

        this.modal.on('hidden.bs.modal', (event: Event) => {
            this.modal.find('#mdl_set_title').text('');
            this.modal.find('#mdl_set_footer').css('display', 'initial');
            this.modal.find('#box_nuevo_consenso').remove();
        });
    }

    /**
     * Mostrar detalle de consenso
     */
    detalle_consenso(e: Event): void {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget);
        const id = target.attr('data-code');
        const consenso = this.consensos.get(parseInt(id || '0'));

        if (!this.modal) this.modal = this.$el.find('#notice_modal');
        this.modal.find('#mdl_set_title').text('Detalle Consenso');
        this.modal.find('#mdl_set_footer').css('display', 'none');

        const view = new ConsensoDetalle({
            model: consenso,
            App: this.App,
            api: this.api,
            logger: this.logger,
            storage: this.storage,
            region: this.region
        });

        this.modal.find('#mdl_set_body').html(view.render().$el);
        this.modal.modal({ backdrop: 'initial', keyboard: true });
        this.modal.show();

        this.modal.on('hidden.bs.modal', (event: Event) => {
            this.modal.find('#mdl_set_title').text('');
            this.modal.find('#mdl_set_footer').css('display', 'initial');
            this.modal.find('#box_detalle_consenso').remove();
        });
    }

    /**
     * Listar asambleas
     */
    listar_asambleas(e: Event): void {
        e.preventDefault();
        this.remove();

        if (this.App && this.App.router) {
            this.App.router.navigate('listar_asambleas', { trigger: true, replace: true });
        }
    }
}
