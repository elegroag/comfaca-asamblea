import { BackboneView } from "@/common/Bone";
import RechazoService from "@/pages/Rechazos/RechazoService";
import tmp_show_subnav from "@/componentes/rechazos/templates/show_subnav.hbs?raw";

interface RechazosNavOptions {
    dataToggle: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazosNav extends BackboneView {
    template: any;
    dataToggle: any;
    model: any;
    parentView: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    rechazoService: RechazoService;

    constructor(options: RechazosNavOptions) {
        super(options);
        this.template = _.template(tmp_show_subnav);
        this.dataToggle = options.dataToggle;
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.rechazoService = new RechazoService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    get events() {
        return {
            'click #bt_listar': 'listarData',
            'click #bt_export_data': 'exportData',
            'click #bt_informe_data': 'informeData',
            'click #bt_nuevo_registro': 'nuevoRegistro',
            'click #bt_masivo_registro': 'masivoRegistro',
            'click #bt_edita_nav_registro': 'editaRegistro',
        };
    }

    informeData(e: Event) {
        e.preventDefault();
        this.staticInformeData();
    }

    exportData(e: Event) {
        e.preventDefault();
        this.staticExportData();
    }

    nuevoRegistro(e: Event) {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('crear', { trigger: true });
        }
    }

    masivoRegistro(e: Event) {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('cargue', { trigger: true });
        }
    }

    listarData(e: Event) {
        e.preventDefault();
        if (this.parentView) this.parentView.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('listar', { trigger: true });
        }
    }

    editaRegistro(e: Event) {
        e.preventDefault();
        const nit = this.model.get('nit');
        if (this.parentView) this.parentView.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    async staticExportData() {
        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea exportar la lista.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const response = await this.rechazoService.__exportarLista();

                            if (response && response.success) {
                                this.rechazoService.download_file(response);
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:warning', {
                                        title: 'Notificación!',
                                        text: response.msj || 'Error al exportar la lista',
                                        button: 'Continuar!'
                                    });
                                }
                            }
                        } catch (error: any) {
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:warning', {
                                    title: 'Notificación!',
                                    text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                    button: 'Continuar!'
                                });
                            }
                        }
                    }
                },
            });
        }
    }

    async staticInformeData() {
        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea generar el informe.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const response = await this.rechazoService.__exportarPdf();

                            if (response && response.success) {
                                this.rechazoService.download_file(response);
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:warning', {
                                        title: 'Notificación!',
                                        text: response.msj || 'Error al generar el informe',
                                        button: 'Continuar!'
                                    });
                                }
                            }
                        } catch (error: any) {
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:warning', {
                                    title: 'Notificación!',
                                    text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                    button: 'Continuar!'
                                });
                            }
                        }
                    }
                },
            });
        }
    }
}
