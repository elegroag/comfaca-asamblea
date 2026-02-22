import { BackboneView } from "@/common/Bone";
import RecepcionService from "@/pages/Recepcion/RecepcionService";
import preregistro_presencial from "@/componentes/recepcion/templates/preregistro_presencial.hbs?raw";

interface PreregistroPresencialOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class PreregistroPresencial extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;
    estado: any;

    constructor(options: PreregistroPresencialOptions) {
        super({ ...options, className: 'box', id: 'box_preregistro_presencial', tagName: 'div' });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(preregistro_presencial);
        this.estado = void 0;
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    events() {
        return {
            'click #bt_cruce_preregistro': 'crucePreregistro',
        };
    }

    render() {
        let template = _.template(this.template);
        this.$el.html(template({ titulo: 'Preregistro Presencial' }));
        return this;
    }

    async crucePreregistro(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea ejecutar el proceso.',
                callback: async (success: boolean) => {
                    target.removeAttr('disabled');

                    if (success) {
                        try {
                            const response = await this.recepcionService.__cruzarHabilPreregistroPresencial();

                            if (response && response.success) {
                                if (this.App && typeof this.App.trigger === 'function') {
                                    this.App.trigger('alert:success', {
                                        title: 'Notificación!',
                                        text: response.data.msj,
                                        button: 'Continuar!'
                                    });
                                }
                            } else {
                                if (this.App && typeof this.App.trigger === 'function') {
                                    this.App.trigger('alert:error', {
                                        title: 'Error!',
                                        text: 'Error al ejecutar el proceso',
                                        button: 'Continuar!'
                                    });
                                }
                            }
                        } catch (error: any) {
                            target.removeAttr('disabled');
                            this.logger?.error('Error al cruzar preregistro:', error);
                            if (this.App && typeof this.App.trigger === 'function') {
                                this.App.trigger('alert:error', {
                                    title: 'Error!',
                                    text: 'Ocurrió un error al ejecutar el proceso',
                                    button: 'Continuar!'
                                });
                            }
                        }
                    }
                },
            });
        } else {
            target.removeAttr('disabled');
        }
    }
}
