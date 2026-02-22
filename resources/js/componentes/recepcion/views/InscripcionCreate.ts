import { BackboneView } from "@/common/Bone";
import RecepcionService from "@/pages/Recepcion/RecepcionService";

interface InscripcionCreateOptions {
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class InscripcionCreate extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;

    constructor(options: InscripcionCreateOptions) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    initialize() {
        this.template = $('#tmp_create_ingreso').html();
    }

    events() {
        return {
            'click #bt_registrar_inscripcion': 'registrarInscripcion',
            "click [name='crear_empresa']": 'crearEmpresa',
        };
    }

    render() {
        let template = _.template(this.template);
        this.$el.html(template());
        return this;
    }

    crearEmpresa(e: Event) {
        let input = this.$(e.currentTarget);
        if (input.is(':checked')) {
            $('.sh-crear_empresa').fadeIn('slow');
        } else {
            $('.sh-crear_empresa').fadeOut('fast');
        }
    }

    async registrarInscripcion(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea realizar el ingreso.',
                callback: async (success: boolean) => {
                    target.removeAttr('disabled');

                    if (success) {
                        try {
                            const nit = this.getInput('nit');
                            const cedrep = this.getInput('cedrep');
                            const nombres = this.getInput('nombres');
                            const apellidos = this.getInput('apellidos');
                            const telefono = this.getInput('telefono');
                            const email = this.getInput('email');
                            const razsoc = this.getInput('razsoc');
                            const is_habil = this.getCheck('is_habil');
                            const omit_estado = this.getCheck('omit_estado');
                            const crear_empresa = this.getCheck('crear_empresa');

                            const token = {
                                cedrep,
                                nombres,
                                nit,
                                apellidos,
                                telefono,
                                email,
                                razsoc,
                                is_habil,
                                omit_estado,
                                crear_empresa,
                            };

                            const response = await this.recepcionService.__salvarInscripcion(token);

                            if (response && response.success) {
                                if (response.data.errors && response.data.errors.length > 0) {
                                    if (this.App && typeof this.App.trigger === 'function') {
                                        this.App.trigger('alert:warning', { message: response.data.errors.join('\n') });
                                    }
                                } else {
                                    if (this.App && typeof this.App.trigger === 'function') {
                                        this.App.trigger('alert:success', { message: response.msj || 'Inscripción guardada exitosamente' });
                                    }
                                }
                            }
                        } catch (error: any) {
                            target.removeAttr('disabled');
                            this.logger?.error('Error al guardar inscripción:', error);
                            if (this.App && typeof this.App.trigger === 'function') {
                                this.App.trigger('alert:error', { message: 'Ocurrió un error al guardar la inscripción' });
                            }
                        }
                    }
                },
            });
        } else {
            target.removeAttr('disabled');
        }
    }

    getInput(selector: string): string {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string | undefined) {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    getCheck(selector: string): number {
        return this.$el.find(`[name='${selector}']:checked`).length;
    }
}
