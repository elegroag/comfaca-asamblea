import { BackboneView } from "@/common/Bone";
import subnav from "@/componentes/trabajadores/templates/tmp_show_subnav.hbs?raw";

interface SubNavUsuariosOptions {
    model?: any;
    dataToggle: {
        listar: boolean;
        crear: boolean;
        editar: boolean;
        exportar?: boolean;
        masivo?: boolean;
    };
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class SubNavUsuarios extends BackboneView {
    template: any;
    dataToggle: SubNavUsuariosOptions['dataToggle'];
    static parentView: SubNavUsuarios | null = null;
    static App: any;

    constructor(options: SubNavUsuariosOptions) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.model = options.model;
        this.template = _.template(subnav);
        this.dataToggle = options.dataToggle;
        this.app = options.app; // Static reference
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

        if (this.parentView) {
            this.parentView.remove();
        }

        if (this.app && this.app.router) {
            this.app.router.navigate('crear', { trigger: true });
        }
    }

    listarData(e: Event): void {
        e.preventDefault();

        if (this.parentView) {
            this.parentView.remove();
        }

        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true });
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

        if (this.parentView) {
            this.parentView.remove();
        }

        if (this.app && this.app.router) {
            this.app.router.navigate('edita/' + nit, { trigger: true });
        }
    }
}
