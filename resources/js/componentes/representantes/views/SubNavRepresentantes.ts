import { BackboneView } from "@/common/Bone";
import subnav from "@/componentes/representantes/templates/subnav.hbs?raw";

interface SubNavRepresentantesOptions {
    dataToggle: any;
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class SubNavRepresentantes extends BackboneView {
    template: any;
    dataToggle: any;
    model: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    static parentView: any;
    static App: any;

    constructor(options: SubNavRepresentantesOptions) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.dataToggle = options.dataToggle;
        this.model = options.model;
        this.template = _.template(subnav);
        // Guardar referencia estática para métodos estáticos
        SubNavRepresentantes.App = options.App;
    }

    get className(): string {
        return 'nav justify-content-end';
    }

    get tagName(): string {
        return 'nav';
    }

    render() {
        const _template = _.template(this.template);
        this.$el.html(_template(this.dataToggle));
        return this;
    }

    get events() {
        return {
            'click #bt_listar': 'listarData',
            'click #bt_nuevo_registro': 'nuevoRegistro',
            'click #bt_edita_nav_registro': 'editaRegistro',
        };
    }

    nuevoRegistro(e: Event) {
        e.preventDefault();
        if (SubNavRepresentantes.parentView) SubNavRepresentantes.parentView.remove();
        if (SubNavRepresentantes.App && SubNavRepresentantes.App.router) {
            SubNavRepresentantes.App.router.navigate('crear', { trigger: true });
        }
    }

    listarData(e: Event) {
        e.preventDefault();
        if (SubNavRepresentantes.parentView) SubNavRepresentantes.parentView.remove();
        if (SubNavRepresentantes.App && SubNavRepresentantes.App.router) {
            SubNavRepresentantes.App.router.navigate('listar', { trigger: true, replace: true });
        }
    }

    editaRegistro(e: Event) {
        e.preventDefault();
        const nit = this.model.get('nit');
        if (SubNavRepresentantes.parentView) SubNavRepresentantes.parentView.remove();
        if (SubNavRepresentantes.App && SubNavRepresentantes.App.router) {
            SubNavRepresentantes.App.router.navigate('edita/' + nit, { trigger: true });
        }
    }
}
