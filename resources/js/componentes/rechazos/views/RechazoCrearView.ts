import { BackboneView } from "@/common/Bone";
import RechazoService from "@/pages/Rechazos/RechazoService";
import crear from "@/componentes/rechazos/templates/crear.hbs?raw";
import RechazoModel from "../models/RechazoModel";

interface RechazoCrearViewOptions {
    model?: any;
    region?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    [key: string]: any;
}

export default class RechazoCrearView extends BackboneView {
    region: any;
    modelUse: any;
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    rechazoService: RechazoService;

    constructor(options: RechazoCrearViewOptions) {
        super({
            ...options,
            className: 'box',
        });
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.modelUse = RechazoModel;
        this.template = _.template(crear);
        this.rechazoService = new RechazoService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    get events() {
        return {
            'click #bt_registrar': 'guardarDatos',
            "focusout input[name='nit']": 'enableBoton',
            "focusout input[name='cedrep']": 'enableBoton',
        };
    }

    async guardarDatos(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        const nit = this.getInput('nit');
        const model = new this.modelUse({
            nit: parseInt(nit),
            cedula_representa: parseInt(this.getInput('cedula_representa')),
            nombre_representa: this.getInput('nombre_representa'),
            telefono: this.getInput('telefono'),
            email: this.getInput('email'),
            razsoc: this.getInput('razsoc'),
            cruzar: this.getCheck('cruzar'),
            criterio: parseInt(this.getInput('criterio')),
        });

        if (nit === '') {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', 'El nit de la empresa es un valor requerido');
            }
            target.removeAttr('disabled');
            return false;
        }

        try {
            const response = await this.rechazoService.__crearRechazo(model.toJSON());

            target.removeAttr('disabled');

            if (response && response.success) {
                this.trigger('add:rechazo', response.data);
                this.trigger('add:notify', model.get('nit'));
                this.$el.find('input').val('');

                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:success', {
                        title: 'Éxito',
                        text: 'Rechazo guardado correctamente',
                        button: 'OK!'
                    });
                }
            } else {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', {
                        title: 'Error',
                        text: response.msj || 'Error al guardar el rechazo',
                        button: 'OK!'
                    });
                }
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al guardar rechazo:', error);
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', {
                    title: 'Error',
                    text: 'Ocurrió un error al guardar el rechazo',
                    button: 'OK!'
                });
            }
        }

        return false;
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

    enableBoton(e: any): void {
        e.preventDefault();
        if ((this.getInput('nit') == '' || this.getInput('cedrep') == '') == false) {
            this.$el.find('#bt_guardar').removeAttr('disabled');
        } else {
            this.$el.find('#bt_guardar').attr('disabled', true);
        }
    }
}
