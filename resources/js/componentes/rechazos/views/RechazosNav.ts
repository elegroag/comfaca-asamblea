import { BackboneView } from "@/common/Bone";
import RechazoService from "@/pages/Rechazos/RechazoService";
import tmp_show_subnav from "@/componentes/rechazos/templates/show_subnav.hbs?raw";

interface RechazosNavOptions {
    dataToggle: any;
    App?: any;
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
    static parentView: any;
    static App: any;
    static rechazoService: RechazoService;

    constructor(options: RechazosNavOptions) {
        super(options);
        this.template = _.template(tmp_show_subnav);
        this.dataToggle = options.dataToggle;
        // Guardar referencias estáticas para métodos estáticos
        RechazosNav.App = options.App;
        RechazosNav.rechazoService = new RechazoService({
            api: options.api,
            logger: options.logger,
            app: options.App
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
        RechazosNav.staticInformeData();
    }

    exportData(e: Event) {
        e.preventDefault();
        RechazosNav.staticExportData();
    }

    nuevoRegistro(e: Event) {
        e.preventDefault();
        if (RechazosNav.parentView) RechazosNav.parentView.remove();
        if (RechazosNav.App && RechazosNav.App.router) {
            RechazosNav.App.router.navigate('crear', { trigger: true });
        }
    }

    masivoRegistro(e: Event) {
        e.preventDefault();
        if (RechazosNav.parentView) RechazosNav.parentView.remove();
        if (RechazosNav.App && RechazosNav.App.router) {
            RechazosNav.App.router.navigate('cargue', { trigger: true });
        }
    }

    listarData(e: Event) {
        e.preventDefault();
        if (RechazosNav.parentView) RechazosNav.parentView.remove();
        if (RechazosNav.App && RechazosNav.App.router) {
            RechazosNav.App.router.navigate('listar', { trigger: true });
        }
    }

    editaRegistro(e: Event) {
        e.preventDefault();
        const nit = this.model.get('nit');
        if (RechazosNav.parentView) RechazosNav.parentView.remove();
        if (RechazosNav.App && RechazosNav.App.router) {
            RechazosNav.App.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    static async staticExportData() {
        if (RechazosNav.App && typeof RechazosNav.App.trigger === 'function') {
            RechazosNav.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea exportar la lista.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const response = await RechazosNav.rechazoService.__exportarLista();

                            if (response && response.success) {
                                RechazosNav.rechazoService.download_file(response);
                            } else {
                                if (RechazosNav.App && typeof RechazosNav.App.trigger === 'function') {
                                    RechazosNav.App.trigger('alert:warning', {
                                        title: 'Notificación!',
                                        text: response.msj || 'Error al exportar la lista',
                                        button: 'Continuar!'
                                    });
                                }
                            }
                        } catch (error: any) {
                            if (RechazosNav.App && typeof RechazosNav.App.trigger === 'function') {
                                RechazosNav.App.trigger('alert:warning', {
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

    static async staticInformeData() {
        if (RechazosNav.App && typeof RechazosNav.App.trigger === 'function') {
            RechazosNav.App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea generar el informe.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            const response = await RechazosNav.rechazoService.__exportarPdf();

                            if (response && response.success) {
                                RechazosNav.rechazoService.download_file(response);
                            } else {
                                if (RechazosNav.App && typeof RechazosNav.App.trigger === 'function') {
                                    RechazosNav.App.trigger('alert:warning', {
                                        title: 'Notificación!',
                                        text: response.msj || 'Error al generar el informe',
                                        button: 'Continuar!'
                                    });
                                }
                            }
                        } catch (error: any) {
                            if (RechazosNav.App && typeof RechazosNav.App.trigger === 'function') {
                                RechazosNav.App.trigger('alert:warning', {
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
