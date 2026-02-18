import { BackboneView } from "@/common/Bone";
import ValidacionPoder from "./ValidacionPoder";
import { Testeo } from "@/core/Testeo";
import { Utils } from "@/core/Utils";
import Poder from "@/models/Poder";
import Loading from "@/common/Loading";
import registroPoder from "@/componentes/poderes/templates/registroPoder.hbs?raw";
import PoderesController from "@/pages/Poderes/PoderesController";


export default class PoderCrear extends BackboneView {
    App: PoderesController;
    constructor(options: any) {
        super(options);
        this.modal = void 0;
        this.App = options.App || null;
    }

    render() {
        let template = _.template(registroPoder);
        this.$el.html(template());
        //@ts-ignore
        this.setInput('fecha', moment().format('DD-MM-YYYY'));
        return this;
    }

    get events() {
        return {
            'click #btn_back_list': 'cancelar',
            'click #btn_validar_poder': 'validaGuardaPoder',
            'click #bt_buscar_poderdante': 'buscarPoderdante',
            'click #bt_buscar_apoderado': 'buscarApoderado',
            'keypress #apoderado_nit': 'keyBuscarApoderado',
            'keypress #poderdante_nit': 'keyBuscarPoderdante',
        };
    }

    keyBuscarApoderado(e: any) {
        var keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 13) {
            this.$el.find('#bt_buscar_apoderado').trigger('click');
        }
    }

    keyBuscarPoderdante(e: any) {
        var keycode = e.keyCode ? e.keyCode : e.which;
        if (keycode == 13) {
            this.$el.find('#bt_buscar_poderdante').trigger('click');
        }
    }

    buscarApoderado(e: Event) {
        e.preventDefault();
        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');

        let _erro = Testeo.identi(apoderado_nit, 'apoderado_nit', 4, 20);
        if (_erro) {
            setTimeout(() => {
                $('.error').html('');
            }, 3000);
            return false;
        }

        if (apoderado_nit == poderdante_nit) {
            this.App.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        this.trigger('search:empresa', {
            nit: apoderado_nit,
            callback: (response: any) => {
                if (response) {
                    const {
                        es_apoderado,
                        es_poderdante,
                        es_habil,
                        reportado_en_cartera,
                        es_trabajador,
                        es_rechazado = 0,
                        cedrep = 0,
                    } = response.empresa;

                    let _errors = [];
                    if (es_apoderado == 1) {
                        _errors.push({
                            texto: 'La empresa ya se encuentra registrada como apoderada.',
                            tbutton: 'Buscar poder',
                            router: '#buscar_apoderado/' + apoderado_nit,
                        });
                    }
                    if (es_poderdante == 1) {
                        _errors.push({
                            texto: 'La empresa ya se encuentra registrada como poderdante.',
                            tbutton: 'Buscar poder',
                            router: '#buscar_poderdante/' + apoderado_nit,
                        });
                    }
                    if (es_rechazado > 0) {
                        _errors.push({
                            texto: 'La empresa ya encuentra rechazada no es habil para Asamblea.',
                            tbutton: ' Listar poderes',
                            router: Utils.getURL('habiles/index#listar'),
                        });
                    }
                    if (es_habil == 0) {
                        _errors.push({
                            texto: 'La empresa no está habil para su ingreso.',
                            tbutton: 'Buscar en habiles',
                            router: Utils.getURL('habiles/index#listar'),
                        });
                    }
                    if (reportado_en_cartera > 0) {
                        _errors.push({
                            texto: 'La empresa está reportada en catera.',
                            tbutton: 'Buscar en cartera',
                            router: Utils.getURL('cartera/index#listar'),
                        });
                    }
                    if (es_trabajador > 0) {
                        _errors.push({
                            texto:
                                'La empresa apoderada pertenece a un Funcionario de la Caja con cedula ' +
                                cedrep +
                                '. No se admite como apoderado.',
                            tbutton: 'Buscar en trabajadores',
                            router: Utils.getURL('trabajadores/index#listar'),
                        });
                    }

                    if (_.size(_errors) > 0) {
                        let view = new ValidacionPoder({ collection: _errors });
                        this.App.trigger('show:modal', 'Validación Poderes', view, { bootstrapSize: 'modal-md' });
                    } else {
                        this.setInput('apoderado_cedula', response.empresa.cedrep);
                        this.setText('razsoc_apoderado', response.empresa.razsoc);
                        this.setText('repleg_apoderado', response.empresa.repleg);
                    }
                }
            },
        });
    }

    buscarPoderdante(e: Event) {
        e.preventDefault();
        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');

        let _erro = Testeo.identi(poderdante_nit, 'poderdante_nit', 4, 20);
        if (_erro) {
            return false;
        }

        if (poderdante_nit == apoderado_nit) {
            this.App.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        this.trigger('search:empresa', {
            nit: poderdante_nit,
            callback: (response: any) => {
                if (response) {
                    const {
                        es_apoderado,
                        es_poderdante,
                        es_habil,
                        reportado_en_cartera,
                        es_trabajador,
                        es_inscrito,
                        es_rechazado = 0,
                    } = response.empresa;

                    let _errors = [];

                    if (es_apoderado == 1) {
                        _errors.push({
                            texto: 'La empresa ya se encuentra registrada como apoderada.',
                            tbutton: 'Buscar poder',
                            router: '#buscar_apoderado/' + poderdante_nit,
                        });
                    }

                    if (es_poderdante == 1) {
                        _errors.push({
                            texto: 'La empresa ya se encuentra registrada como poderdante.',
                            tbutton: 'Buscar poder',
                            router: '#buscar_poderdante/' + poderdante_nit,
                        });
                    }

                    if (es_rechazado > 0) {
                        _errors.push({
                            texto: 'La empresa ya encuentra rechazada no es habil para Asamblea.',
                            tbutton: ' Listar poderes',
                            router: Utils.getURL('habiles/index#listar'),
                        });
                    }

                    if (es_habil == 0) {
                        _errors.push({
                            texto: 'La empresa no está habil para su ingreso.',
                            tbutton: 'Buscar en habiles',
                            router: Utils.getURL('habiles/index#listar'),
                        });
                    }

                    if (reportado_en_cartera > 0) {
                        _errors.push({
                            texto: 'La empresa está reportada en catera.',
                            tbutton: 'Buscar en cartera',
                            router: Utils.getURL('cartera/index#listar'),
                        });
                    }

                    if (_.size(_errors) > 0) {
                        let view = new ValidacionPoder({ collection: _errors });
                        this.App.trigger('show:modal', 'Validación Poderes', view, { bootstrapSize: 'modal-md' });
                    } else {
                        if (es_inscrito > 0) {
                            this.App.trigger(
                                'alert:warning',
                                `La empresa poderdante con nit: ${response.empresa.nit} ha realizado el proceso de inscripción a la Asamblea. Para efecto de registro de poder,
								está empresa perdera el derecho de asistencia y la inscripción y pasara a un estado de rechazo.\n
								La presente notificación es informativa y no afecta el registro del poder.`
                            );
                        }
                        this.setInput('poderdante_cedula', response.empresa.cedrep);
                        this.setText('razsoc_poderdante', response.empresa.razsoc);
                        this.setText('repleg_poderdante', response.empresa.repleg);
                    }
                }
            },
        });
    }

    validaGuardaPoder(e: Event) {
        e.preventDefault();
        var target = $(e.currentTarget);
        target.attr('disabled', true);
        const apoderado_nit = this.getInput('apoderado_nit');
        const apoderado_cedula = this.getInput('apoderado_cedula');
        const poderdante_nit = this.getInput('poderdante_nit');
        const poderdante_cedula = this.getInput('poderdante_cedula');
        const radicado = this.getInput('radicado');

        let model = new Poder({
            nit1: apoderado_nit,
            cedrep1: apoderado_cedula,
            nit2: poderdante_nit,
            cedrep2: poderdante_cedula,
            radicado: radicado,
            criterio_rechazo: '',
            notificacion: '',
            estado: 'A',
        });

        model.setForRechazo(false);

        if (apoderado_nit == '') {
            this.App.trigger('alert:warning', 'Requiere del nit de la empresa apoderada');
            target.removeAttr('disabled');
            return false;
        }

        if (poderdante_nit == '') {
            this.App.trigger('alert:warning', 'Requiere del nit de la empresa poderdante');
            target.removeAttr('disabled');
            return false;
        }

        if (apoderado_nit == poderdante_nit) {
            target.removeAttr('disabled');
            this.App.trigger('alert:warning', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        if (!model.isValid()) {
            let errors = model.validationError;
            this.App.trigger('alert:error', errors.toString());

            setTimeout(() => {
                $('.error').html('');
            }, 3000);

            target.removeAttr('disabled');
            this.setInput('fecha', moment().format('DD-MM-YYYY'));
            return false;
        }

        const url = Utils.getURL('poderes/validacion_previa');
        this.App.trigger('syncro', {
            url: url,
            data: {
                nit1: apoderado_nit,
                cedrep1: apoderado_cedula,
                nit2: poderdante_nit,
                cedrep2: poderdante_cedula,
                radicado: radicado,
            },
            callback: (salida: any) => {
                Loading.hide();
                target.removeAttr('disabled');
                if (salida) {
                    if (salida.success === true) {
                        if (salida.poder === false) {
                            this.App.trigger('alert:error', salida.msj);
                        } else {
                            this.App.trigger('success', salida.msj);
                            this.App.trigger('add:poder', new Poder(salida.poder));
                        }
                    } else {
                        this.App.trigger('alert:error', salida.msj);
                    }
                    this.$el.find('input').val('');
                    this.setText('razsoc_apoderado', 'Razón social');
                    this.setText('razsoc_poderdante', 'Razón social');
                    this.setText('repleg_apoderado', 'Representante legal');
                    this.setText('repleg_poderdante', 'Representante legal');

                    this.setInput('fecha', moment().format('DD-MM-YYYY'));
                } else {
                    this.App.trigger('alert:error', 'Error generado en la solicitud de cambio');
                }
            },
        });

        return false;
    }

    getInput(selector: string) {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string) {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }

    setText(selector: string, val: string) {
        return this.$el.find(`[id='${selector}']`).text(val ?? '');
    }

    cancelar(e: Event) {
        e.preventDefault();
        this.remove();
        this.App.router.navigate('listar', { trigger: true, replace: true });
        return false;
    }
}
