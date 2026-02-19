import { BackboneView } from "@/common/Bone";
import tmp_sub_navbar from "../templates/tmp_sub_navbar.hbs?raw";

declare global {
    var $: any;
    var _: any;
    var $App: any;
}

interface SubNavMesasOptions {
    model?: any;
    dataToggle: {
        listar: boolean;
        crear: boolean;
        editar: boolean;
    };
}

export default class SubNavMesas extends BackboneView {
    template: string;
    dataToggle: SubNavMesasOptions['dataToggle'];
    static parentView: SubNavMesas | null = null;

    constructor(options: SubNavMesasOptions) {
        super(options);
        this.template = tmp_sub_navbar;
        this.dataToggle = options.dataToggle;
    }

    get className(): string {
        return 'nav justify-content-end';
    }

    get tagName(): string {
        return 'nav';
    }

    render(): this {
        const template = _.template(this.template);
        this.$el.html(template(this.dataToggle));
        return this;
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #bt_listar': this.listarData,
            'click #bt_nuevo_registro': this.nuevoRegistro,
            'click #bt_edita_nav_registro': this.editaRegistro,
        };
    }

    nuevoRegistro(e: Event): void {
        e.preventDefault();

        if (SubNavMesas.parentView) {
            SubNavMesas.parentView.remove();
        }

        if ($App.router) {
            $App.router.navigate('crear', { trigger: true });
        }
    }

    listarData(e: Event): void {
        e.preventDefault();

        if (SubNavMesas.parentView) {
            SubNavMesas.parentView.remove();
        }

        if ($App.router) {
            $App.router.navigate('listar', { trigger: true });
        }
    }

    editaRegistro(e: Event): void {
        e.preventDefault();

        let nit: string;

        if (this.model && typeof this.model.get === 'function') {
            nit = this.model.get('nit');
        } else {
            console.error('Modelo no disponible o sin método get');
            return;
        }

        if (!nit) {
            console.error('NIT no encontrado en el modelo');
            return;
        }

        if (SubNavMesas.parentView) {
            SubNavMesas.parentView.remove();
        }

        if ($App.router) {
            $App.router.navigate('edita/' + nit, { trigger: true });
        }
    }
}
