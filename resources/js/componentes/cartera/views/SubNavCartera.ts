import { BackboneView } from "@/common/Bone";
import Cartera from "@/models/Cartera";
import tmp_sub_navbar from "../templates/tmp_sub_navbar.hbs?raw";
import { AppInstance } from "@/types/types";


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
    static parentView: BackboneView | undefined;

    constructor(options: any) {
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
        if (SubNavCartera.parentView) SubNavCartera.parentView.remove();
        this.router.navigate('crear', { trigger: true });
    }

    listarData(e: Event): void {
        e.preventDefault();
        if (SubNavCartera.parentView) SubNavCartera.parentView.remove();
        this.router.navigate('listar', { trigger: true, replace: true });
    }

    editaRegistro(e: Event): void {
        e.preventDefault();
        const nit = this.model.get('nit');
        if (SubNavCartera.parentView) SubNavCartera.parentView.remove();
        this.router.navigate('editar/' + nit, { trigger: true });
    }

    masivoRegistro(e: Event): void {
        e.preventDefault();
        if (SubNavCartera.parentView) SubNavCartera.parentView.remove();
        this.router.navigate('cargue', { trigger: true });
    }
}

export default SubNavCartera;
