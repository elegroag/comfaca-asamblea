import { BackboneView } from "@/common/Bone";
import tmp_show_subnav from '../templates/show_subnav.hbs?raw';
import EmpresaService from "@/pages/Habiles/EmpresaService";

interface EmpresaNavOptions {
    dataToggle?: string;
    model?: any;
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    router?: { navigate: (fragment: string, options?: any) => void };
    parentView?: any;
}

export default class EmpresaNav extends BackboneView {
    dataToggle: string;
    model?: any;
    collection?: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    router?: { navigate: (fragment: string, options?: any) => void };
    parentView?: any;
    empresaService: EmpresaService;

    constructor(options: EmpresaNavOptions = {}) {
        super(options);
        this.template = _.template(tmp_show_subnav);
        this.dataToggle = options.dataToggle || '';
        this.model = options.model;
        this.collection = options.collection;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.router = options.router;
        this.parentView = options.parentView;

        // Inicializar el servicio con las dependencias
        this.empresaService = new EmpresaService({
            api: this.api,
            App: this.app,
            logger: this.logger
        });
    }

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
        if (this.parentView) this.parentView.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('crear', { trigger: true });
        }
    }

    masivoRegistro(e: Event): void {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('masivo', { trigger: true });
        }
    }

    listarData(e: Event): void {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('listar', { trigger: true });
        }
    }

    editaRegistro(e: Event): void {
        e.preventDefault();
        const nit = this.model?.get('nit');
        if (this.parentView) this.parentView.remove();
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
    async exportData(e: Event): Promise<void> {
        e.preventDefault();
        try {
            // Confirmación con SweetAlert
            const result = await Swal.fire({
                title: 'Confirmar',
                text: 'Se requiere de confirmar si desea exportar la lista.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, exportar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed && typeof this.trigger === 'function') {
                this.trigger('export:lista');
            }
        } catch (error: any) {
            this.logger?.error('Error al exportar lista:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error al exportar' });
        }
    }

    async informeData(e: Event): Promise<void> {
        e.preventDefault();
        try {
            // Confirmación con SweetAlert
            const result = await Swal.fire({
                title: 'Confirmar',
                text: 'Se requiere de confirmar si desea generar el informe.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, generar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed && typeof this.trigger === 'function') {
                this.trigger('export:informe');
            }
        } catch (error: any) {
            this.logger?.error('Error al generar informe:', error);
            this.app?.trigger('alert:error', { message: error.message || 'Error al generar informe' });
        }
    }
}
