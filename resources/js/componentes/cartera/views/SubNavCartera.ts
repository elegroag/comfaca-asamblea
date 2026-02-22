import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import tmp_sub_navbar from "@/componentes/cartera/templates/tmp_sub_navbar.hbs?raw";
import CarteraService from "@/pages/Cartera/CarteraService";


interface SubNavCarteraOptions {
    model?: Cartera;
    dataToggle: DataToggle;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    parentView?: BackboneView;
    router?: any;
}

interface DataToggle {
    listar: boolean;
    crear: boolean;
    editar: boolean;
    masivo: boolean;
    exportar: boolean;
}

class SubNavCartera extends BackboneView {
    template: string;
    dataToggle: DataToggle;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    parentView: BackboneView | undefined;
    router: any;
    carteraService: CarteraService;

    constructor(options: SubNavCarteraOptions) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.parentView = options.parentView;
        this.router = options.router;
        this.template = tmp_sub_navbar;
        this.dataToggle = options.dataToggle;

        // Inicializar el servicio con las dependencias
        this.carteraService = new CarteraService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    get className(): string {
        return 'nav justify-content-end';
    }

    get tagName(): string {
        return 'nav';
    }

    render(): SubNavCartera {
        const template = _.template(this.template);
        this.$el.html(template(this.dataToggle));
        return this;
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #bt_listar': this.listarData,
            'click #bt_nuevo_registro': this.nuevoRegistro,
            'click #bt_edita_nav_registro': this.editaRegistro,
            'click #bt_masivo_registro': this.masivoRegistro,
        };
    }

    nuevoRegistro(e: Event): void {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.router) {
            this.router.navigate('crear', { trigger: true });
        } else {
            this.logger?.error('Router no disponible en SubNavCartera');
        }
    }

    listarData(e: Event): void {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.router) {
            this.router.navigate('listar', { trigger: true, replace: true });
        } else {
            this.logger?.error('Router no disponible en SubNavCartera');
        }
    }

    editaRegistro(e: Event): void {
        e.preventDefault();
        if (!this.model) {
            this.logger?.error('Modelo no disponible en SubNavCartera');
            return;
        }

        const nit = this.model.get('nit');
        if (this.parentView) this.parentView.remove();
        if (this.router) {
            this.router.navigate('editar/' + nit, { trigger: true });
        } else {
            this.logger?.error('Router no disponible en SubNavCartera');
        }
    }

    masivoRegistro(e: Event): void {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.router) {
            this.router.navigate('cargue', { trigger: true });
        } else {
            this.logger?.error('Router no disponible en SubNavCartera');
        }
    }
}

export default SubNavCartera;
