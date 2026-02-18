'use strict';

import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import RechazarDetallePoder from "./RechazarDetallePoder";
import { Utils } from "@/core/Utils";
import detallePoder from "@/componentes/poderes/templates/detallePoder.hbs?raw";

export default class PoderDetalle extends BackboneView {
    App: AppInstance;
    constructor(options: any) {
        super(options);
        this.App = options.App;
    }

    initialize() {
        this.criterios_rechazos = void 0;
        this.habil_apoderado = void 0;
        this.habil_poderdante = void 0;
    }

    get events() {
        return {
            'click #btn_back_list': 'backList',
            "switchChange.bootstrapSwitch [id='estado_poder']": 'changeValidaEstado',
        };
    }

    backList(e: Event) {
        e.preventDefault();
        this.remove();
        this.App.router.navigate('listar', { trigger: true, replace: true });
        return false;
    }

    changeValidaEstado(e: Event) {
        let $input = $(e.currentTarget);
        if ($input.is(':checked')) {
            if (this.model.get('estado') == 'A') return false;

            this.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea activar el poder.',
                callback: (continuar: boolean) => {
                    if (continuar) {
                        this.App.trigger('syncro', {
                            url: Utils.getURL('poderes/empresa_activar/' + this.model.get('documento')),
                            data: {},
                            callback: (salida: any) => {
                                if (salida) {
                                    if (salida.success) {
                                        this.model.set('estado', 'A');
                                        this.$el.find('#show_criterio_rechazo').text('No Aplicado');
                                        this.$el.find('#show_estado_text').text('ACTIVO');

                                        this.App.trigger('alert:success', salida.msj);
                                    } else {
                                        this.App.trigger('alert:error', salida.err);
                                    }
                                }
                            },
                        });
                    } else {
                        this.$el.find("[id='estado_poder']").trigger('click');
                    }
                },
            });
        } else {
            if (this.model.get('estado') == 'A') {
                let view = new RechazarDetallePoder({ model: this.model, collection: this.criterios_rechazos });
                this.App.trigger('show:modal', 'Rechazar Poder Detalle', view, { bootstrapSize: 'modal-lg' });
                this.listenTo(view, 'change:criterio', this.__changeCriterio);
            }
        }
    }

    render() {
        const { apoderado, poderdante, criteriosRechazos } = this.collection[0];

        this.habil_apoderado = apoderado;
        this.habil_poderdante = poderdante;
        this.criterios_rechazos = criteriosRechazos;

        let template = _.template(detallePoder);
        this.$el.html(
            template({
                poder: this.model.toJSON(),
                habil_apoderado: this.habil_apoderado.toJSON(),
                habil_poderdante: this.habil_poderdante.toJSON(),
                criterios_rechazos: this.criterios_rechazos,
            })
        );
        this.$el.find("[id='estado_poder']").bootstrapSwitch();
        return this;
    }

    __changeCriterio(model: any, motivo: any) {
        let criterioRechazo = model.get('criterio_rechazo');
        if (criterioRechazo) {
            $('#show_motivo_rechazo').html(motivo);
            $('#show_estado_text').text('RECHAZADO');
        } else {
            $('#show_motivo_rechazo').html('No Aplicado');
            $('#show_estado_text').text('ACTIVO');
        }
    }
}
