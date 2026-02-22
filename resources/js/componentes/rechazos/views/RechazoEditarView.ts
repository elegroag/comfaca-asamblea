import { BackboneView } from "@/common/Bone";
import RechazosNav from "./RechazosNav";
import RechazoService from "@/pages/Rechazos/RechazoService";
import editar from "@/componentes/rechazos/templates/editar.hbs?raw";

interface RechazoEditarViewOptions {
    model?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazoEditarView extends BackboneView {
    model: any;
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    rechazoService: RechazoService;

    constructor(options: RechazoEditarViewOptions) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(editar);
        this.rechazoService = new RechazoService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize() {
        // Template ya inicializado en el constructor
    }

    get events() {
        return { 'click #bt_edita_registro': 'editaRegistro' };
    }

    render() {
        const _template = _.template(this.template);
        const model = this.serealizeData();
        this.$el.html(_template(model));
        this.subNav();
        return this;
    }

    subNav() {
        const subnav = new RechazosNav({
            model: this.model,
            dataToggle: {
                listar: true,
                exportar: false,
                crear: true,
                editar: false,
                masivo: true,
            },
        });
        subnav.render();
        this.$el.find('#showSubnav').html(subnav.$el);
        (RechazosNav as any).parentView = this;
    }

    serealizeData(): any {
        const data = this.model ? this.model.toJSON() : {};
        return data;
    }

    async editaRegistro(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        const modelData = {
            nit: parseInt(this.getInput('nit')),
            cedrep: parseInt(this.getInput('cedrep')),
            repleg: this.getInput('repleg'),
            telefono: this.getInput('telefono'),
            email: this.getInput('email'),
            razsoc: this.getInput('razsoc'),
            crear_pre_registro: this.getCheck('crear_pre_registro'),
            cruzar_cartera: this.getCheck('cruzar_cartera'),
        };

        try {
            const response = await this.rechazoService.__actualizarRechazo(modelData);

            target.removeAttr('disabled');

            if (response && response.success) {
                this.trigger('item:edit', modelData);

                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:success', {
                        title: 'Éxito',
                        text: 'Rechazo actualizado correctamente',
                        button: 'OK!'
                    });
                }
            } else {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', {
                        title: 'Error',
                        text: response.msj || 'Error al actualizar el rechazo',
                        button: 'OK!'
                    });
                }
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al actualizar rechazo:', error);
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', {
                    title: 'Error',
                    text: 'Ocurrió un error al actualizar el rechazo',
                    button: 'OK!'
                });
            }
        }
    }

    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string): void {
        this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    getCheck(selector: string): number {
        return this.$el.find(`[name='${selector}']:checked`).length;
    }

    serealizeForm(el: any): any {
        let _dataArray = el.find('#formulario').serializeArray();
        let _token: any = {};
        let i = 0;
        while (i < _.size(_dataArray)) {
            _token[_dataArray[i].name] = _dataArray[i].value.toUpperCase();
            i++;
        }
        return _token;
    }
}
