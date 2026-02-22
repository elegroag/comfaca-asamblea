import { BackboneView } from "@/common/Bone";
import RecepcionService from "@/pages/Recepcion/RecepcionService";
import crear from "@/componentes/recepcion/templates/crear.hbs?raw";
import ModalView from "./ModalView";

interface AsistenciasCrearOptions {
    model?: any;
    collection?: any[];
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasCrear extends BackboneView {
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;
    votos: number;
    poderes: any[];
    empresas: any[];

    constructor(options: AsistenciasCrearOptions) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.template = _.template(crear);
        this.votos = 0;
        this.poderes = [];
        this.empresas = [];
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    events() {
        return {
            'click #bt_registrar_ingreso': 'registrarIngreso',
            "click [name='check_dispone_poder']": 'checkDisponePoder',
            'click #bt_buscar_poder': 'buscarEmpresaPoder',
            "keypress input[name='nit_poder']": 'buscarEmpresaPoderKey',
            'click #bt_cancelar_poder': 'cancelarPoder',
            'click #borrar_poder': 'borrarPoder',
            'click #borrar_poder_server': 'borrarPoderServer',
        };
    }

    initialize() {
        // Template ya inicializado en el constructor
        this.votos = 0;
        this.poderes = [];
        this.empresas = [];
    }

    render() {
        const { empresas, votos, poderes } = this.collection[0];
        this.votos = votos;
        this.poderes = poderes;
        this.empresas = empresas;

        let _template = _.template(this.template);
        // Establecer fecha y hora actuales sin dependencia global moment
        const now = new Date();
        this.$el.html(
            _template({
                representante: this.model.toJSON(),
                empresas: this.empresas,
                fecha: now.toISOString().split('T')[0], // YYYY-MM-DD
                hora: now.toTimeString().slice(0, 5), // HH:mm
                votos: this.votos,
                poderes: this.poderes,
            })
        );
        return this;
    }

    async registrarIngreso(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget as HTMLElement);
        const cedrep = this.model.get('cedrep');
        const apoderado = this.getCheck('check_apoderado');
        const nit_poder = this.getInput('crear_add_poder');
        const radicado = this.getInput('radicado');
        const has_poderes = nit_poder !== undefined && nit_poder !== '' ? 1 : -1;

        if (cedrep === '') {
            if (this.app && typeof this.app.trigger === 'function') {
                this.app.trigger('warning', 'La identificación del representante es requerida para hacer el ingreso.');
            }
            target.attr('disabled', 'true');
            return false;
        }

        const token = {
            cedrep,
            has_poderes,
            nit_poder,
            votos: this.votos,
            apoderado,
            radicado,
        };

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea realizar el ingreso.',
                callback: async (success: boolean) => {
                    if (success) {
                        try {
                            const response = await (this.recepcionService as any).__crearIngreso(token);

                            target.removeAttr('disabled');

                            if (response && response.success) {
                                if (response.errors && response.errors.length > 0) {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:warning', { message: response.errors.join('\n') });
                                    }
                                } else {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:success', { message: response.msj || 'Ingreso creado exitosamente' });
                                    }
                                }

                                if (response.asistentes && response.asistentes.length > 0) {
                                    response.asistentes.forEach((asistente: any) => {
                                        this.trigger('add:asistencia', asistente);
                                    });
                                }

                                this.trigger('set:fichaIngreso', true);
                                if (this.app && this.app.router) {
                                    this.app.router.navigate('ficha/' + cedrep, { trigger: true, replace: true });
                                }
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:error', { message: response.msj || 'Error al crear ingreso' });
                                }
                            }
                        } catch (error: any) {
                            target.removeAttr('disabled');
                            this.logger?.error('Error al crear ingreso:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', { message: 'Ocurrió un error al realizar el ingreso' });
                            }
                        }
                    } else {
                        target.removeAttr('disabled');
                    }
                },
            });
        } else {
            target.removeAttr('disabled');
        }
    }

    checkDisponePoder(e: Event) {
        let _input = this.$el.find(e.currentTarget);
        if (_input.is(':checked')) {
            this.$el.find('#content_buscar_empresa').fadeIn('slow');
        } else {
            this.$el.find('#content_buscar_empresa').fadeOut('slow');
        }
    }

    buscarEmpresaPoder(e: Event) {
        e.preventDefault();
        const nit_poder = this.getInput('nit_poder');
        this.trigger('search:poder', {
            nit_poder,
            callback: (response: any) => {
                if (response) {
                    if (response.success) {
                        const tpl = _.template($('#tmp_empresa_poder').html());
                        new ModalView({
                            model: {
                                footer: -1,
                                size: 'modal-lg',
                                title: 'Detalle empresa',
                                content: tpl(response),
                                data: response,
                                votos: this.votos,
                            },
                        }).render().$el;
                    } else {
                        $App.trigger('alert:error', response.msj);
                    }
                }
            },
        });
    }

    buscarEmpresaPoderKey(e: any) {
        const keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 13) {
            const nit_poder = this.getInput('nit_poder');
            this.trigger('search:poder', {
                nit_poder,
                callback: (response: any) => {
                    if (response) {
                        if (response.success) {
                            const tpl = _.template($('#tmp_empresa_poder').html());
                            new ModalView({
                                model: {
                                    footer: -1,
                                    size: 'modal-lg',
                                    title: 'Detalle empresa',
                                    content: tpl(response),
                                    data: response,
                                    votos: this.votos,
                                },
                            }).render().$el;
                        } else {
                            $App.trigger('alert:error', { message: response.msj });
                        }
                    }
                },
            });
        } else {
            return false;
        }
    }

    cancelarPoder(e: JQuery.Event) {
        this.$el.find("[name='check_dispone_poder']").trigger('click');
    }

    borrarPoder(e: JQuery.Event) {
        e.preventDefault();
        $('#data_content_poder').html('');
        $('#card_poder').fadeOut('');
        let votos = this.votos;
        $('#num_votos_admitidos').text(votos);
    }

    async borrarPoderServer(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget as HTMLElement);
        const token = {
            cedrep: parseInt(this.model.get('cedrep')),
            nit: parseInt(target.attr('data-code') || '0'),
        };
        target.attr('disabled', 'true');

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea borrar el registro de poder.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const response = await this.recepcionService.__revocarPoder(token);

                            target.removeAttr('disabled');

                            if (response) {
                                if (response.success) {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:success', { message: response.msj });
                                    }
                                    if (typeof Backbone.history !== 'undefined' && Backbone.history.loadUrl) {
                                        Backbone.history.loadUrl();
                                    }
                                } else {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:error', { message: response.msj || 'Error al revocar poder' });
                                    }
                                }
                            }
                        } catch (error: any) {
                            target.removeAttr('disabled');
                            this.logger?.error('Error al revocar poder:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', { message: 'Ocurrió un error al revocar el poder' });
                            }
                        }
                    } else {
                        target.removeAttr('disabled');
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
