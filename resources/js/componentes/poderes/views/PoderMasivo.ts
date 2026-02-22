'use strict';

import { BackboneView } from "@/common/Bone";
import Loading from "@/common/Loading";
import { Utils } from "@/core/Utils";
import type { AppInstance } from "@/types/types";
import cargueMasivo from "@/componentes/poderes/templates/cargueMasivo.hbs?raw";

export default class PoderMasivo extends BackboneView {
    app: AppInstance;

    constructor(options: any) {
        super(options);
        this.id = 'box_masivo';
        this.tagName = 'div';
        this.App = options.App || null;
    }

    get events() {
        return {
            "click [data-toggle-file='searchfile']": 'searchFile',
            'click #remover_archivo': 'removerArchivo',
            'click #bt_hacer_cargue': 'hacerCargue',
        };
    }

    hacerCargue(e: Event) {
        e.preventDefault();
        var target = this.$el.find(e.currentTarget);
        target.attr('disabled', true);

        const archivo_poderes = document.querySelector<HTMLInputElement>('#archivo_masivo')?.files;
        if (!archivo_poderes) return false;

        if (archivo_poderes && archivo_poderes.length == 0) {
            target.removeAttr('disabled');
            return false;
        }

        const formData = new FormData();
        formData.append('file', archivo_poderes[0]);
        ($ as any).ajax({
            url: Utils.getURL('poderes/cargue_masivo'),
            method: 'POST',
            dataType: 'JSON',
            cache: false,
            data: formData,
            contentType: false,
            processData: false,
            beforeSend: () => {
                Loading.show();
            },
        })
            .done((salida: any) => {
                Loading.hide();
                target.removeAttr('disabled');
                if (salida) {
                    if (salida.success) {
                        this.app.trigger(
                            'success',
                            `Ya se completo el cargue de los habiles.\n
							 Registrados: ${salida.creados}\n
							 Cantidad: ${salida.filas}\n
							 Fallos: ${salida.fallidos}
							`
                        );
                    } else {
                        this.app.trigger('error', salida.msj);
                    }
                    this.$el.find('#archivo_poderes').val('');
                    this.$el.find('#name_archivo').text('Seleccionar aquí...');
                    this.$el.find('#remover_archivo').attr('disabled', true);
                }
            })
            .fail((err: any) => {
                target.removeAttr('disabled');
                Loading.hide();
                this.app.trigger('error', err.resposeText);
                this.$el.find('#archivo_poderes').val('');
                this.$el.find('#name_archivo').text('Seleccionar aquí...');
                this.$el.find('#remover_archivo').attr('disabled', true);
            });
    }

    removerArchivo(e: Event) {
        e.preventDefault();
        this.$el.find('#archivo_habiles').val('');
        this.$el.find('#name_archivo').text('Seleccionar aquí...');
        this.$el.find('#remover_archivo').attr('disabled', true);
        this.$el.find('#bt_hacer_cargue').attr('disabled', true);
    }

    searchFile(e: Event) {
        e.preventDefault();
        this.$el.find("[name='archivo_masivo']").trigger('click');
    }

    render() {
        const template = _.template(cargueMasivo);
        this.$el.html(template());
        return this;
    }
}
