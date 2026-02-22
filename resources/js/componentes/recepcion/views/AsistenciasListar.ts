import { BackboneView } from "@/common/Bone";
import RecepcionService from "@/pages/Recepcion/RecepcionService";
import DataTable from "datatables.net-bs5";

interface AsistenciasListarOptions {
    collection?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasListar extends BackboneView {
    template!: string;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    recepcionService: RecepcionService;

    constructor(options: AsistenciasListarOptions = {}) {
        super(options);
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.recepcionService = new RecepcionService({
            api: this.api,
            logger: this.logger,
            app: this.app,
        });
    }

    initialize() {
        // Template ya inicializado en el constructor
        this.render();
    }

    events() {
        return {
            'click #bt_export_data': 'export_data',
            "click button[data-toggle='bt_registro_ingreso']": 'registroIngreso',
            "click button[data-toggle='bt_borrar_ingreso']": 'borrarIngreso',
            'click #bt_reporte_data': 'reporte_data',
        };
    }

    render() {
        let _template = _.template(this.template);
        this.$el.html(_template({ asistencias: this.collection.toJSON() }));
        this.initTable();
        return this;
    }

    async borrarIngreso(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        target.attr('disabled', 'true');

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea remover la inscripción.',
                callback: async (success: boolean) => {
                    target.removeAttr('disabled');

                    if (success) {
                        try {
                            const documento = target.attr('data-code');
                            const response = await this.recepcionService.__removerInscripcion(documento);

                            if (response.status === 200) {
                                // Recargar la página actual de forma segura
                                if (this.app && this.app.router) {
                                    this.app.router.navigate('listar', { trigger: true, replace: true });
                                }
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:success', response.data.msj);
                                }
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:error', response.data?.msj || 'Error al remover inscripción');
                                }
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al remover inscripción:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', 'Ocurrió un error al remover la inscripción');
                            }
                        }
                    }
                },
            });
        } else {
            target.removeAttr('disabled');
        }
    }

    registroIngreso(event: Event) {
        event.preventDefault();
        let nit = this.$el.find(event.currentTarget).attr('data-code');
        if (this.app && this.app.router) {
            this.app.router.navigate('registro_empresa/' + nit, { trigger: true });
        }
    }

    async export_data(e: Event) {
        e.preventDefault();

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea exportar la lista.',
                callback: async (success: boolean) => {
                    if (success) {
                        try {
                            const response = await this.recepcionService.__exportarLista();

                            if (response.status === 200) {
                                if (response.data.status === 200) {
                                    // Delegar al servicio para descargar archivo
                                    this.recepcionService.download_file(response.data);
                                } else {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:warning', {
                                            title: 'Notificación!',
                                            text: response.data.msj,
                                            button: 'Continuar!'
                                        });
                                    }
                                }
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:warning', {
                                        title: 'Notificación!',
                                        text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                        button: 'Continuar!',
                                        timer: 8000
                                    });
                                }
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al exportar lista:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', 'Ocurrió un error al exportar los datos');
                            }
                        }
                    }
                },
            });
        }
    }

    reporte_data(e: Event) {
        e.preventDefault();

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea generar reporte.',
                callback: async (success: boolean) => {
                    if (success) {
                        try {
                            const response = await this.recepcionService.__generarReporteQuorum();

                            if (response.status === 200) {
                                if (response.data.status === 200) {
                                    // Delegar al servicio para descargar archivo
                                    this.recepcionService.download_file(response.data);
                                } else {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:warning', {
                                            title: 'Notificación!',
                                            text: response.data.msj,
                                            button: 'Continuar!'
                                        });
                                    }
                                }
                            } else {
                                if (this.app && typeof this.app.trigger === 'function') {
                                    this.app.trigger('alert:warning', {
                                        title: 'Notificación!',
                                        text: 'Se detecta un error al exportar los datos. Comunicar a soporte técnico',
                                        button: 'Continuar!',
                                        timer: 8000
                                    });
                                }
                            }
                        } catch (error: any) {
                            this.logger?.error('Error al generar reporte:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', 'Ocurrió un error al generar el reporte');
                            }
                        }
                    }
                },
            });
        }
    }

    initTable() {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_asistencias'), {
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            columns: [
                { data: 'empresa' },
                { data: 'nit' },
                { data: 'cedrep' },
                { data: 'hora' },
                { data: 'fecha' },
                { data: 'estado' },
                { data: 'votos' },
                { data: 'documento' },
            ],
            order: [[7, 'desc']],
            language: {
                lengthMenu: 'Mostrar _MENU_ registros',
                zeroRecords: 'No se encontraron resultados',
                info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
                infoEmpty: 'Mostrando 0 a 0 de 0 registros',
                infoFiltered: '(filtrado de _MAX_ registros totales)',
                search: 'Buscar:',
                paginate: {
                    first: 'Primero',
                    last: 'Último',
                    next: 'Siguiente',
                    previous: 'Anterior'
                }
            },
            destroy: true
        });
    }
}
