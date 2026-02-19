import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import asambleaDetalle from "@/componentes/asamblea/templates/asambleaDetalle.hbs?raw";

declare global {
    var $: any;
    var _: any;
    var $App: any;
}

interface AsambleaDetalleOptions {
    model?: any;
    App?: AppInstance;
    [key: string]: any;
}

export default class AsambleaDetalle extends BackboneView {
    App: AppInstance;
    template: string;

    constructor(options: AsambleaDetalleOptions = {}) {
        super(options);
        this.App = options.App || options.AppInstance;
    }

    initialize(): void {
        this.template = $('#tmp_asamblea_detalle').html();
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template({ asamblea: this.model.toJSON() }));
        return this;
    }

    get events() {
        return {
            'click #bt_back': 'back',
        };
    }

    /**
     * Volver a la vista de listado
     */
    back(): void {
        this.remove();

        if ($App.router) {
            $App.router.navigate('listar_asambleas', { trigger: true, replace: true });
        }
    }
}
