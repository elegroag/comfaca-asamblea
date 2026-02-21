import { BackboneView } from "@/common/Bone";
import type { AppInstance } from '@/types/types';
import listarAsambleas from "@/componentes/asamblea/templates/listarAsambleas.hbs?raw";


interface AsambleaListarOptions {
    collection?: any;
    App: AppInstance | null;
    [key: string]: any;
}

export default class AsambleaListar extends BackboneView {

    constructor(options: AsambleaListarOptions) {
        super(options);
    }

    initialize(): void {
        this.template = $('#tmp_list_asambleas').html();
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(
            template({
                asambleas: this.collection.toJSON(),
            })
        );
        return this;
    }

    get events() {
        return {
            'click #bt_back': 'back',
            "click [data-toggle='mostrar_asamblea']": 'mostrar_asamblea',
        };
    }

    /**
     * Mostrar detalle de asamblea
     */
    mostrar_asamblea(e: Event): void {
        e.preventDefault();
        this.remove();
        const _id = this.$el.find(e.currentTarget).attr('data-code');

        if (this.router) {
            this.router.navigate('asamblea_detalle/' + _id, { trigger: true, replace: true });
        }
    }

    /**
     * Volver a la vista anterior
     */
    back(e: Event): void {
        e.preventDefault();
        this.remove();

        if (this.router) {
            this.router.navigate('asamblea', { trigger: true, replace: true });
        }
    }
}
