'use strict';

import { BackboneView } from "@/common/Bone";
import { Testeo } from "@/core/Testeo";
import { Utils } from "@/core/Utils";
import type { AppInstance } from "@/types/types";
import buscarPoder from "@/componentes/poderes/templates/buscarPoder.hbs?raw";

export default class PoderBuscar extends BackboneView {

    App: AppInstance;
    constructor(options: any) {
        super(options);
        this.App = options.App || null;
    }


    buscarPoder(e: any) {
        e.preventDefault();
        const apoderado_nit = this.getInput('apoderado_nit');
        const apoderado_identificacion = this.getInput('apoderado_identificacion');
        const poderdante_nit = this.getInput('poderdante_nit');
        const poderdante_identificacion = this.getInput('poderdante_identificacion');

        const _errors = new Array();
        let _erro: string | null = null;
        let items = 0;

        if (apoderado_nit != '') {
            items++;
            _erro = Testeo.identi(apoderado_nit, 'apoderado_nit', 4, 20) as string | null;
            if (_erro) _errors.push(_erro);
        }
        if (poderdante_nit != '') {
            items++;
            _erro = Testeo.identi(poderdante_nit, 'poderdante_nit', 4, 20) as string | null;
            if (_erro) _errors.push(_erro);
        }
        if (apoderado_identificacion != '') {
            items++;
            _erro = Testeo.identi(apoderado_identificacion, 'apoderado_identificacion', 4, 20) as string | null;
            if (_erro) _errors.push(_erro);
        }
        if (poderdante_identificacion != '') {
            items++;
            _erro = Testeo.identi(poderdante_identificacion, 'poderdante_identificacion', 4, 20) as string | null;
            if (_erro) _errors.push(_erro);
        }
        if (items == 0) {
            this.App.trigger('alert:error', 'El sistema requiere de uno de los criterio de busqueda.');
            return false;
        }

        if (_errors.length > 0) {
            setTimeout(() => {
                $('.error').html('');
            }, 3000);
            return false;
        }
        const token = {
            apoderado_nit: apoderado_nit,
            apoderado_id: apoderado_identificacion,
            poderdante_nit: poderdante_nit,
            poderdante_id: poderdante_identificacion,
        };
        this.App.trigger('syncro', {
            url: Utils.getURL('poderes/buscar'),
            data: token,
            callback: (response: any) => {
                if (response) {
                    if (!response.poder) {
                        this.App.trigger('warning', response.msj);
                    } else {
                        var _id = response.poder.documento;
                        this.remove();
                        this.App.router.navigate('mostrar/' + _id, { trigger: true, replace: true });
                    }
                }
            },
        });
        return false;
    }

    get events() {
        return {
            'click #btn_buscar_poder': 'buscarPoder',
        };
    }

    render() {
        let _template = _.template(buscarPoder);
        this.$el.html(_template());
        return this;
    }

    getInput(selector: any) {
        return this.$el.find(`[name='${selector}']`).val();
    }

    setInput(selector: any, val: any) {
        return this.$el.find(`[name='${selector}']`).val(val ?? '');
    }
}
