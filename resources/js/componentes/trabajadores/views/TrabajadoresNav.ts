import { BackboneView } from "@/common/Bone";
import tmp_show_subnav from "../templates/show_subnav.hbs?raw";

interface TrabajadoresNavOptions {
    dataToggle: any;
    [key: string]: any;
    api: any;
    logger: any;
    app: any;
    model: any;
}

export default class TrabajadoresNav extends BackboneView {
    template!: any;
    dataToggle: any;
    model: any;
    static parentView: any;

    constructor(options: TrabajadoresNavOptions) {
        super(options);
        this.template = _.template(tmp_show_subnav);
        this.dataToggle = options.dataToggle;
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

    informeData(e: any) {
        e.preventDefault();
        TrabajadoresNav.staticInformeData();
    }

    exportData(e: any) {
        e.preventDefault();
        TrabajadoresNav.staticExportData();
    }

    nuevoRegistro(e: any) {
        e.preventDefault();
        if (TrabajadoresNav.parentView) TrabajadoresNav.parentView.remove();
        $App.router.navigate('crear', { trigger: true });
    }

    masivoRegistro(e: any) {
        e.preventDefault();
        if (TrabajadoresNav.parentView) TrabajadoresNav.parentView.remove();
        $App.router.navigate('cargue', { trigger: true });
    }

    listarData(e: any) {
        e.preventDefault();
        if (TrabajadoresNav.parentView) TrabajadoresNav.parentView.remove();
        $App.router.navigate('listar', { trigger: true });
    }

    editaRegistro(e: any) {
        e.preventDefault();
        let nit = this.model.get('nit');
        if (TrabajadoresNav.parentView) TrabajadoresNav.parentView.remove();
        $App.router.navigate('edita/' + nit, { trigger: true });
    }

    static staticExportData() {
        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea exportar la lista.',
            callback: (status: boolean) => {
                if (status) {
                    const url = create_url('rechazos/exportar_lista');
                    $App.trigger('syncro', {
                        url: url,
                        data: {},
                        callback: (response: any) => {
                            if (response) {
                                if (response.success) {
                                    download_file(response);
                                } else {
                                    Swal.fire({
                                        title: 'Notificación!',
                                        text: response.msj,
                                        icon: 'warning',
                                        button: 'Continuar!',
                                    });
                                }
                            } else {
                                Swal.fire({
                                    title: 'Notificación!',
                                    text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                    icon: 'warning',
                                    button: 'Continuar!',
                                    timer: 8000,
                                });
                            }
                        },
                    });
                }
            },
        });
    }

    static staticInformeData() {
        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea generar el informe.',
            callback: (status: boolean) => {
                if (status) {
                    const url = create_url('rechazos/exportar_pdf');
                    $App.trigger('syncro', {
                        url,
                        data: {},
                        callback: (response: any) => {
                            if (response) {
                                if (response.success) {
                                    download_file(response);
                                } else {
                                    Swal.fire({
                                        title: 'Notificación!',
                                        text: response.msj,
                                        icon: 'warning',
                                        button: 'Continuar!',
                                    });
                                }
                            } else {
                                Swal.fire({
                                    title: 'Notificación!',
                                    text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                    icon: 'warning',
                                    button: 'Continuar!',
                                    timer: 8000,
                                });
                            }
                        },
                    });
                }
            },
        });
    }
}
