'use strict';

import { BackboneView } from "@/common/Bone";
import { Utils } from "@/core/Utils";
import type { AppInstance } from '@/types/types';
import rechazarPoder from '@/componentes/poderes/templates/rechazarPoder.hbs?raw';

export default class RechazarDetallePoder extends BackboneView {
    App: AppInstance;
    constructor(options: any) {
        super({ ...options, id: 'box_rechazo_poder' });
        this.App = options.App;
    }

    get events() {
        return {
            'click #bt_rechazo_poder': 'rechazoPoder',
            'click #copyMemory': 'copyMemory',
            'click #bt_salir': 'salir',
        };
    }

    get className() {
        return 'box';
    }

    render() {
        const _template = _.template(rechazarPoder);
        this.$el.html(
            _template({
                model: this.model.toJSON(),
                criterios_rechazos: this.collection.toJSON(),
            })
        );

        this.$el.find('#criterio_rechazo').selectpicker({
            header: 'Seleccionar criterio',
            size: 'auto',
            showIcon: false,
            width: '100%',
            liveSearch: true,
            style: 'btn btn-primary',
            liveSearchStyle: 'contains',
        });
        return this;
    }

    copyMemory(e: Event) {
        e.preventDefault();
        const id = this.$el.find('#criterio_rechazo').val();
        if (id === '') return false;
        let motivo = this.getInput('motivo');
        const criterio = this.collection.get(parseInt(id));

        motivo =
            motivo == ''
                ? criterio.get('estatutos') + ' ' + criterio.get('detalle')
                : motivo + '\n' + criterio.get('estatutos') + ' ' + criterio.get('detalle') + ', ';
        this.setInput('motivo', motivo);
    }

    salir(e: Event) {
        e.preventDefault();
        this.App.trigger('hide:modal', this);
        this.trigger('change:criterio', this.model, this.model.get('notificacion'));
    }

    rechazoPoder(e: Event) {
        e.preventDefault();
        const criterioRechazo = this.getInput('criterio_rechazo');
        const motivo = this.getInput('motivo');

        if (!criterioRechazo) {
            $("[toggle-error='criterio_rechazo']").text('No se ha seleccionado un criterio de rechazo para continuar.');
            setTimeout(() => {
                $("[toggle-error='criterio_rechazo']").text('');
            }, 3000);
            return false;
        }

        const url = Utils.getURL('poderes/empresa_inactivar/' + this.model.get('documento'));
        this.App.trigger('syncro', {
            url: url,
            data: {
                motivo: motivo,
                criterio_rechazo: criterioRechazo,
            },
            callback: (response: any) => {
                if (response) {
                    this.model.set('estado', 'I');
                    this.model.set('criterio_rechazo', parseInt(criterioRechazo));
                    this.model.set('notificacion', motivo);

                    this.trigger('change:criterio', this.model, motivo);
                    this.App.trigger('alert:success', response.msj);
                    this.App.trigger('hide:modal', this);
                }
            },
        });
    }

    getInput(selector: string) {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: string, val: string) {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }
}
