import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import tmp_asamblea_detalle from "@/componentes/asamblea/templates/asambleaDetalle.hbs?raw";


interface AsambleaDetalleOptions {
    model?: any;
    App: AppInstance | null;
    [key: string]: any;
}

export default class AsambleaDetalle extends BackboneView {

    constructor(options: AsambleaDetalleOptions) {
        super(options);
    }

    initialize(): void {
        this.template = tmp_asamblea_detalle;
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
        if (this.App && this.App.router) {
            this.App.router.navigate('listar_asambleas', { trigger: true, replace: true });
        }
    }
}
