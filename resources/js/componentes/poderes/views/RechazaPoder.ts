'use strict';

import { BackboneView } from "@/common/Bone";
import { Utils } from "@/core/Utils";
import Poder from "@/models/Poder";
import type { AppInstance } from "@/types/types";
import crearRechazoPoder from '@/componentes/poderes/templates/crearRechazoPoder.hbs?raw';

export default class RechazaPoder extends BackboneView {
    App: AppInstance;

    constructor(options: any) {
        super(options);
        this.App = options.App || null;
    }

    initialize() {
        this.modal = void 0;
    }

    get events() {
        return {
            'click #btn_back_list': 'backList',
            'click #btnRegistraRechazo': 'registraRechazo',
            'click #bt_buscar_poderdante': 'buscarPoderdante',
            'click #bt_buscar_apoderado': 'buscarApoderado',
            'keypress #apoderado_nit': 'keyBuscarApoderado',
            'keypress #poderdante_nit': 'keyBuscarPoderdante',
            'click #copyMemory': 'copyMemory',
        };
    }

    render() {
        let template = _.template(crearRechazoPoder);
        this.$el.html(template({ criterios_rechazos: this.collection.toJSON() }));
        this.$el.find("[name='fecha']").val(moment().format('DD-MM-YYYY'));

        /*   this.$el.find('#criterio_rechazo').selectpicker({
              header: 'Seleccionar criterio',
              size: 'auto',
              showIcon: false,
              width: '100%',
              liveSearch: true,
              style: 'btn btn-primary',
              liveSearchStyle: 'contains',
          }); */
        return this;
    }

    copyMemory(e: Event) {
        e.preventDefault();
        let id = this.$el.find('#criterio_rechazo').val();
        let criterio = this.collection.get(parseInt(id));
        let motivo = this.$el.find('#motivo').val();
        motivo =
            motivo == ''
                ? criterio.get('estatutos') + ' ' + criterio.get('detalle')
                : motivo + '\n' + criterio.get('estatutos') + ' ' + criterio.get('detalle') + ', ';
        this.$el.find('#motivo').val(motivo);
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

        if (apoderado_nit == poderdante_nit) {
            this.App.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        if (apoderado_nit !== '') {
            this.App.trigger('syncro', {
                url: Utils.getURL('poderes/buscar_empresa/' + apoderado_nit),
                data: {},
                callback: (response: any) => {
                    if (response) {
                        if (!response.success) {
                            this.App.trigger('alert:error', response.msj);
                        } else {
                            const empresa = response.empresa;
                            this.setInput('apoderado_cedula', empresa.cedrep);
                            this.setInput('razsoc_apoderado', empresa.razsoc);
                            this.setInput('repleg_apoderado', empresa.repleg);
                        }
                    } else {
                        this.App.trigger(
                            'alert:error',
                            'Se ha generado un error interno. Se requiere de reportar al área de TICS'
                        );
                    }
                },
            });
        } else {
            this.setInput('apoderado_cedula', '');
            this.setInput('razsoc_apoderado', '');
            this.setInput('repleg_apoderado', '');
        }
    }

    buscarPoderdante(e: Event) {
        e.preventDefault();
        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');

        if (poderdante_nit == apoderado_nit) {
            this.$App.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            return false;
        }

        if (poderdante_nit !== '') {
            this.App.trigger('syncro', {
                url: Utils.getURL('poderes/buscar_empresa/' + poderdante_nit),
                data: {},
                callback: (response: any) => {
                    if (response) {
                        if (!response.success) {
                            this.App.trigger('alert:error', response.msj);
                        } else {
                            const empresa = response.empresa;
                            this.setInput('poderdante_cedula', empresa.cedrep);
                            this.setInput('razsoc_poderdante', empresa.razsoc);
                            this.setInput('repleg_poderdante', empresa.repleg);
                        }
                    } else {
                        this.App.trigger(
                            'alert:error',
                            'Se ha generado un error interno. Se requiere de reportar al área de TICS'
                        );
                    }
                },
            });
        } else {
            this.setInput('poderdante_cedula', '');
            this.setInput('razsoc_poderdante', '');
            this.setInput('repleg_poderdante', '');
        }
    }

    registraRechazo(e: Event) {
        e.preventDefault();
        var target = $(e.currentTarget);
        target.attr('disabled', true);

        const apoderado_nit = this.getInput('apoderado_nit');
        const poderdante_nit = this.getInput('poderdante_nit');
        const apoderado_cedula = this.getInput('apoderado_cedula');
        const poderdante_cedula = this.getInput('poderdante_cedula');
        const radicado = this.getInput('radicado');
        const criterio_rechazo = this.getInput('criterio_rechazo');
        const notificacion = this.getInput('motivo');

        const model = new Poder({
            nit1: apoderado_nit,
            cedrep1: apoderado_cedula,
            nit2: poderdante_nit,
            cedrep2: poderdante_cedula,
            radicado: radicado,
            criterio_rechazo: criterio_rechazo,
            notificacion: notificacion,
            estado: 'R',
        });

        if (apoderado_nit == '' && poderdante_nit == '') {
            this.App.trigger('alert:error', 'La empresa poderdante no puede ser la misma empresa apoderada.');
            target.removeAttr('disabled');
            return false;
        }

        model.setForRechazo(true);

        if (!model.isValid()) {
            this.App.trigger('alert:error', model.validationError);
            setTimeout(() => $('.error').html(''), 3000);
            target.removeAttr('disabled');
            this.setInput('fecha', moment().format('DD-MM-YYYY'));
            return false;
        }

        this.App.trigger('syncro', {
            url: Utils.getURL('poderes/registraRechazoPoder'),
            data: model.toJSON(),
            callback: (response: any) => {
                target.removeAttr('disabled');
                if (response) {
                    if (!response.poder) {
                        Swal.fire(<SweetAlertOptions>{
                            title: 'Notificación Error!',
                            text: response.errors,
                            icon: 'error',
                            button: 'Continuar!',
                        });
                    } else {
                        this.App.trigger('success', response.msj);

                        _.each(response.poder, (value, key) => model.set(key, value));
                        this.trigger('add:poder', model);

                        this.$el.find('input').val('');
                        this.setText('razsoc_apoderado', 'Razón social');
                        this.setText('razsoc_poderdante', 'Razón social');
                        this.setText('repleg_apoderado', 'Representante legal');
                        this.setText('repleg_poderdante', 'Representante legal');
                        this.setInput('fecha', moment().format('DD-MM-YYYY'));

                        this.App.router.navigate('mostrar/' + model.get('documento'), { trigger: true, replace: true });
                    }
                } else {
                    this.setText('razsoc_apoderado', 'Razón social');
                    this.setText('razsoc_poderdante', 'Razón social');
                    this.setText('repleg_apoderado', 'Representante legal');
                    this.setText('repleg_poderdante', 'Representante legal');
                    this.setInput('fecha', moment().format('DD-MM-YYYY'));
                }
            },
        });

        return false;
    }

    backList(e: Event) {
        e.preventDefault();
        this.remove();
        this.App.router.navigate('listar', { trigger: true, replace: true });
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
}
