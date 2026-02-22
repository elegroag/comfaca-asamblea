import { BackboneView } from "@/common/Bone";
import RepresentanteService from "@/pages/Representantes/RepresentanteService";
import crear from "@/componentes/representantes/templates/tmp_crear.hbs?raw";

interface RepresentanteCrearOptions {
    isNew: boolean;
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RepresentanteCrear extends BackboneView {
    isNew: boolean;
    template: any;
    model: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    representanteService: RepresentanteService;

    constructor({ isNew, ...options }: RepresentanteCrearOptions) {
        super(options);
        this.isNew = isNew;
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(crear);
        this.representanteService = new RepresentanteService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize() {
        // Template ya inicializado en el constructor
    }

    get events() {
        return {
            'click #btn_back_list': 'backlist',
            'click #bt_guardar': 'guardarData',
            "focusout [name='cedrep']": 'changeCedrep',
            "focusout [name='nit']": 'changeNit',
        };
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(
            template({
                representante: this.model.toJSON(),
                isNew: this.isNew,
                title: this.isNew ? 'Crear Representante' : 'Editar Representante',
            })
        );
        this.subNav();
        return this;
    }

    changeCedrep(e: Event) {
        e.preventDefault();
        const value = this.$el.find(e.currentTarget).val();

        // Validación básica (simulando Testeo.identi)
        const _erro = !value || value.length < 5 || value.length > 20;
        if (_erro) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', 'La cedula del representante no es un valor valido');
            }
            return false;
        }

        if (value) {
            this.trigger('valid:representante', {
                cedrep: parseInt(value),
                callback: (response: any) => {
                    if (response) {
                        this.$el.find('#bt_guardar').removeAttr('disabled');
                    }
                },
            });
        } else {
            this.$el.find('#bt_guardar').attr('disabled', 'true');
        }
    }

    changeNit(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const value = target.val();

        // Validación básica (simulando Testeo.identi)
        const _erro = !value || value.length < 5 || value.length > 20;
        if (_erro) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', 'El nit de la empresa no es un valor valido');
            }
            return false;
        }

        if (value) {
            this.trigger('search:empresa', {
                nit: parseInt(value),
                callback: (response: any) => {
                    if (response) {
                        const { empresa } = response;
                        if (this.app && typeof this.app.trigger === 'function') {
                            this.app.trigger('confirma', {
                                message: `La empresa ${empresa.razsoc} ya está registrada y con representante legal, desea continuar el cambio de representante ${empresa.repleg} y la cedula ${empresa.cedrep}`,
                                callback: (status: boolean) => {
                                    if (status == false) {
                                        target.val('');
                                    }
                                },
                            });
                        }
                    } else {
                        target.val('');
                    }
                },
            });
        }
    }

    async guardarData(e: Event) {
        e.preventDefault();
        const clave = this.getInput('clave');

        // Validación básica (simulando Testeo.numerico)
        let err = !/^\d+$/.test(clave);
        if (err) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', 'Error con el valor númerico de la clave');
            }
            this.setInput('clave', '');
            return false;
        }

        // Validación básica (simulando Testeo.identi)
        err = !clave || clave.length < 5 || clave.length > 12;
        if (err) {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', 'La clave debe tener entre 5 y 12 caracteres');
            }
            return false;
        }

        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        try {
            const response = await this.representanteService.__crearRepresentante(this.model.toJSON());

            target.removeAttr('disabled');

            if (response && response.success) {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:success', {
                        title: 'Éxito',
                        text: 'Representante guardado correctamente',
                        button: 'OK!'
                    });
                }
                this.router.navigate('listar', { trigger: true, replace: true });
            } else {
                if (this.app && typeof this.app.trigger === 'function') {
                    this.app.trigger('alert:error', {
                        title: 'Error',
                        text: response.msj || 'Error al guardar el representante',
                        button: 'OK!'
                    });
                }
            }
        } catch (error: any) {
            target.removeAttr('disabled');
            this.logger?.error('Error al guardar representante:', error);
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('alert:error', {
                    title: 'Error',
                    text: 'Ocurrió un error al guardar el representante',
                    button: 'OK!'
                });
            }
        }
    }

    backlist(e: Event) {
        e.preventDefault();
        this.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true, replace: true });
        }
        return false;
    }

    subNav() {
        // Implementación básica de subNav sin dependencias externas
        this.$el.find('#showSubnav').html('<div class="subnav-placeholder"></div>');
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
}
