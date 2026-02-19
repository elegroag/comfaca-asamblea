import { BackboneView } from "@/common/Bone";

interface AsistenciasCrearOptions {
    model?: any;
    collection?: any[];
    App?: any;
    [key: string]: any;
}

export default class AsistenciasCrear extends BackboneView {
    template!: string;
    App: any;
    votos: number;
    poderes: any[];
    empresas: any[];

    constructor(options: AsistenciasCrearOptions = {}) {
        super(options);
        this.App = options.App;
        this.votos = 0;
        this.poderes = [];
        this.empresas = [];
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
        this.template = $('#tmp_asistencias_crear').html();
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
        this.$el.html(
            _template({
                representante: this.model.toJSON(),
                empresas: this.empresas,
                fecha: moment().format('YYYY-MM-DD'),
                hora: moment().format('HH:mm'),
                votos: this.votos,
                poderes: this.poderes,
            })
        );
        return this;
    }

    registrarIngreso(e: JQuery.Event) {
        e.preventDefault();
        var target = $(e.currentTarget);
        const cedrep = this.model.get('cedrep');
        const apoderado = this.getCheck('check_apoderado');
        const nit_poder = this.getInput('crear_add_poder');
        const radicado = this.getInput('radicado');
        const has_poderes = nit_poder !== undefined && nit_poder !== '' ? 1 : -1;

        if (cedrep == '') {
            $App.trigger('warning', 'La identificación del representante es requerida para hacer el ingreso.');
            target.attr('disabled', true);
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

        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea realizar el ingreso.',
            callback: (success: boolean) => {
                if (success) {
                    loading.show();

                    const url = create_url('habiles/crear_ingreso');
                    $App.trigger('syncro', {
                        url,
                        data: token,
                        callback: (response: any) => {
                            loading.hide();
                            target.removeAttr('disabled');
                            if (response.success) {
                                if (_.size(response.errors) > 0) {
                                    $App.trigger('warning', response.errors.join('\n'));
                                } else {
                                    $App.trigger('success', response.msj);
                                }

                                if (_.size(response.asistentes) > 0) {
                                    _.each(response.asistentes, (asistente: any) => {
                                        this.trigger('add:asistencia', asistente);
                                    });
                                }

                                this.trigger('set:fichaIngreso', true);
                                $App.router.navigate('ficha/' + cedrep, { trigger: true, replace: true });
                            } else {
                                $App.trigger('alert:error', response.msj);
                            }
                        },
                    });
                }
            },
        });
    }

    checkDisponePoder(e: JQuery.Event) {
        let _input = $(e.currentTarget);
        if (_input.is(':checked')) {
            this.$el.find('#content_buscar_empresa').fadeIn('slow');
        } else {
            this.$el.find('#content_buscar_empresa').fadeOut('slow');
        }
    }

    buscarEmpresaPoder(e: JQuery.Event) {
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

    buscarEmpresaPoderKey(e: JQuery.Event) {
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
                            $App.trigger('alert:error', response.msj);
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

    borrarPoderServer(e: JQuery.Event) {
        e.preventDefault();
        var target = this.$el.find(e.currentTarget);
        const token = {
            cedrep: parseInt(this.model.get('cedrep')),
            nit: parseInt(target.attr('data-code')),
        };
        target.attr('disabled', true);

        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea borrar el registro de poder.',
            callback: (status: boolean) => {
                if (status) {
                    $App.trigger('syncro', {
                        url: create_url('recepcion/revocarPoder'),
                        data: token,
                        callback: (response: any) => {
                            target.removeAttr('disabled');
                            if (response) {
                                if (response.success) {
                                    $App.trigger('alert:success', response.msj);
                                    Backbone.history.loadUrl();
                                } else {
                                    $App.trigger('alert:error', response.msj);
                                }
                            }
                        },
                    });
                } else {
                    target.removeAttr('disabled');
                }
            },
        });
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
