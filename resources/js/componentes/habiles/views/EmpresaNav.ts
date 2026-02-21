import { BackboneView } from "@/common/Bone";
import tmp_show_subnav from '../templates/show_subnav.hbs?raw';

interface EmpresaNavOptions {
    dataToggle?: string;
    model?: any;
    collection?: any;
    api?: any;
    App?: { trigger: (event: string, payload: any) => void } | any;
    router?: { navigate: (fragment: string, options?: any) => void } | any;
}

export default class EmpresaNav extends BackboneView {

    constructor(options: EmpresaNavOptions = {}) {
        super(options);
        this.template = _.template(tmp_show_subnav);
        this.dataToggle = options.dataToggle;
        this.router = options.router;
        this.App = options.App;
    }

    static parentView: any;

    get className(): string {
        return 'col';
    }

    get tagName(): string {
        return 'nav';
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #bt_listar': this.listarData,
            'click #bt_export_data': this.exportData,
            'click #bt_informe_data': this.informeData,
            'click #bt_nuevo_registro': this.nuevoRegistro,
            'click #bt_masivo_registro': this.masivoRegistro,
            'click #bt_edita_nav_registro': this.editaRegistro,
        };
    }

    nuevoRegistro(e: Event): void {
        e.preventDefault();
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('crear', { trigger: true });
        }
    }

    masivoRegistro(e: Event): void {
        e.preventDefault();
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('masivo', { trigger: true });
        }
    }

    listarData(e: Event): void {
        e.preventDefault();
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('listar', { trigger: true });
        }
    }

    editaRegistro(e: Event): void {
        e.preventDefault();
        const nit = this.model?.get('nit');
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if (this.router && nit && typeof this.router.navigate === 'function') {
            this.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    static staticExportData(): void {
        // Mantener método estático por compatibilidad: emitir evento global si fuera necesario
        // Recomendado: usar instancia (exportData) con this.App y delegar a controller/service
    }

    static staticInformeData(): void {
        // Mantener método estático por compatibilidad: ver comentario en staticExportData
    }

    // Nuevas acciones: confirman con App y delegan al controller/service vía eventos
    exportData(e: Event): void {
        e.preventDefault();
        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea exportar la lista.',
                callback: (status: boolean) => {
                    if (status && typeof this.trigger === 'function') {
                        this.trigger('export:lista');
                    }
                },
            });
        }
    }

    informeData(e: Event): void {
        e.preventDefault();
        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea generar el informe.',
                callback: (status: boolean) => {
                    if (status && typeof this.trigger === 'function') {
                        this.trigger('export:informe');
                    }
                },
            });
        }
    }
}
