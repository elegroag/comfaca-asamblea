import { BackboneView } from "@/common/Bone";

interface EmpresaNavOptions {
    dataToggle?: string;
    model?: any;
    collection?: any;
    api?: any;
    App?: any;
    router?: any;
}

export default class EmpresaNav extends BackboneView {
    template: any;
    dataToggle?: string;
    static parentView: any;

    constructor(options: EmpresaNavOptions = {}) {
        super(options);
        this.template = _.template(document.getElementById('tmp_show_subnav')?.innerHTML || '');
        this.dataToggle = options.dataToggle;
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

    informeData(e: Event): void {
        e.preventDefault();
        EmpresaNav.staticInformeData();
    }

    exportData(e: Event): void {
        e.preventDefault();
        EmpresaNav.staticExportData();
    }

    nuevoRegistro(e: Event): void {
        e.preventDefault();
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if ($App.router) {
            $App.router.navigate('crear', { trigger: true });
        }
    }

    masivoRegistro(e: Event): void {
        e.preventDefault();
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if ($App.router) {
            $App.router.navigate('masivo', { trigger: true });
        }
    }

    listarData(e: Event): void {
        e.preventDefault();
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if ($App.router) {
            $App.router.navigate('listar', { trigger: true });
        }
    }

    editaRegistro(e: Event): void {
        e.preventDefault();
        const nit = this.model?.get('nit');
        if (EmpresaNav.parentView) EmpresaNav.parentView.remove();
        if ($App.router && nit) {
            $App.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    static staticExportData(): void {
        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea exportar la lista.',
                callback: (status: boolean) => {
                    if (status) {
                        const url = create_url('habiles/exportar_lista');
                        $App.trigger('syncro', {
                            url: url,
                            data: {},
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        if (download_file) {
                                            download_file(response);
                                        }
                                    } else {
                                        if (Swal) {
                                            Swal.fire({
                                                title: 'Notificación!',
                                                text: response.msj,
                                                icon: 'warning',
                                                button: 'Continuar!',
                                            });
                                        }
                                    }
                                } else {
                                    if (Swal) {
                                        Swal.fire({
                                            title: 'Notificación!',
                                            text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                            icon: 'warning',
                                            button: 'Continuar!',
                                            timer: 8000,
                                        });
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }

    static staticInformeData(): void {
        if ($App && typeof $App.trigger === 'function') {
            $App.trigger('confirma', {
                message: 'Se requiere de confirmar si desea generar el informe.',
                callback: (status: boolean) => {
                    if (status) {
                        const url = create_url('habiles/exportar_pdf');
                        $App.trigger('syncro', {
                            url,
                            data: {},
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        if (download_file) {
                                            download_file(response);
                                        }
                                    } else {
                                        if (Swal) {
                                            Swal.fire({
                                                title: 'Notificación!',
                                                text: response.msj,
                                                icon: 'warning',
                                                button: 'Continuar!',
                                            });
                                        }
                                    }
                                } else {
                                    if (Swal) {
                                        Swal.fire({
                                            title: 'Notificación!',
                                            text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                            icon: 'warning',
                                            button: 'Continuar!',
                                            timer: 8000,
                                        });
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }
}
