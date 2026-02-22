import { BackboneModel, BackboneView } from "@/common/Bone";
import PoderRowView from "./PoderRowView";
import listarPoderes from "@/componentes/poderes/templates/listarPoderes.hbs?raw";
import { capitalize } from "@/core/Utils";
import DataTable from 'datatables.net-bs5';
import PoderesService from "@/pages/Poderes/PoderService";

interface PoderesListarViewOptions {
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class PoderesListarView extends BackboneView {
    tableModule: any | null;
    subNavView: any;
    children: any[];
    modelView: typeof PoderRowView;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    poderesService: PoderesService;

    constructor(options: PoderesListarViewOptions) {
        super(options);
        this.app = options.app || null;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.tableModule = null;
        this.children = [];
        this.modelView = PoderRowView;

        // Inicializar el servicio
        this.poderesService = new PoderesService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    get className() {
        return 'box';
    }

    initialize() {
        this.children = [];
        this.tableModule = null;
        this.modelView = PoderRowView;

        this.listenTo(this.collection, 'add', this.addModel);
        this.listenTo(this.collection, 'remove', this.removeModel);
        this.listenTo(this.collection, 'reset', this.render);
    }

    get events() {
        return {
            "click [data-toggle='row-show']": 'detallePoder',
            "click [data-toggle='row-remove']": 'removePoder',
            'click #bt_export_data': 'exportData',
            'click #bt_informe_data': 'informeData',
            'click #bt_acta_poderes': 'actaPoderes',
        };
    }

    render() {
        const _template = _.template(listarPoderes);
        this.el.innerHTML = _template({ datatable: 'tb_data_poderes' });

        // Limpiar filas existentes y children
        this.$('#show_data_poderes').empty();
        this.closeChildren();

        // Renderizar cada modelo como una fila usando renderModel
        this.collection.forEach((model: any) => {
            const rowView = this.renderModel(model);
            this.$('#show_data_poderes').append(rowView.$el);
        });

        // Inicializar DataTable después de renderizar las filas
        this.initTable();

        return this;
    }

    async actaPoderes(e: Event) {
        e.preventDefault();
        this.app?.trigger('confirma', {
            message: 'Se requiere de confirmar si desea generar el Acta.',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.api) {
                            this.app?.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.api.get('/poderes/actaRevisionVerificacionPoderes') as any;

                        if (response && response.success) {
                            this.app?.trigger('download_file', response);
                        } else {
                            this.app?.trigger('error', response?.msj || 'Error al generar el acta');
                        }
                    } catch (error: any) {
                        this.app?.trigger('alert:error',
                            'Se detecta un error al exportar los datos. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }

    async informeData(e: Event) {
        e.preventDefault();
        this.app?.trigger('confirma', {
            message: 'Se requiere de confirmar si desea generar el informe.',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.api) {
                            this.app?.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.api.get('/poderes/exportar_pdf') as any;

                        if (response && response.success) {
                            this.app?.trigger('download_file', response);
                        } else {
                            this.app?.trigger('error', response?.msj || 'Error al generar el informe');
                        }
                    } catch (error: any) {
                        this.app?.trigger('alert:warning',
                            'Se detecta un error al exportar los datos. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }

    async exportData(e: Event) {
        e.preventDefault();
        this.app?.trigger('confirma', {
            message: 'Se requiere de confirmar si desea exportar la lista.',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.api) {
                            this.app?.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.api.get('/poderes/exportar_lista') as any;

                        if (response && response.success) {
                            this.app?.trigger('download_file', response);
                        } else {
                            this.app?.trigger('error', response?.msj || 'Error al exportar la lista');
                        }
                    } catch (error: any) {
                        this.app?.trigger('warning',
                            'Se detecta un error al exportar los datos. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }

    detallePoder(e: Event) {
        e.preventDefault();
        let documento = this.$el.find(e.currentTarget).attr('data-code');
        if (this.app && this.app.router) {
            this.app.router.navigate('mostrar/' + documento, { trigger: true, replace: true });
        }
    }

    initTable(): void {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }
        this.tableModule = new DataTable(this.$el.find('#tb_data_poderes'), {
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            columnDefs: [
                { targets: 0, width: '10%' },
                { targets: 1, width: '15%' },
                { targets: 2, width: '15%' },
                { targets: 3, width: '15%' },
                { targets: 4, width: '10%' },
                { targets: 5, width: '10%' },
                { targets: 6, width: '10%' },
                { targets: 7, orderable: false, width: '15%' },
            ],
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

    addModel(model: BackboneModel) {
        const view = this.renderModel(model);
        this.$el.find('#show_data_poderes').append(view.$el);

        // Si DataTable está inicializado, recargarlo
        if (this.tableModule) {
            this.tableModule.row.add(view.$el).draw();
        }
    }

    renderModel(model: BackboneModel): PoderRowView {
        let view: PoderRowView | undefined;
        const modelCid = model.get('cid');

        // Reutilizar vista existente si está disponible
        if (this.children[modelCid]) {
            view = this.children[modelCid] as PoderRowView;
        } else {
            // Crear nueva vista con todas las dependencias
            view = new PoderRowView({
                model,
                app: this.app,
                api: this.api,
                logger: this.logger,
                storage: this.storage,
                region: this.region
            });

            // Guardar referencia y configurar eventos
            this.children[modelCid] = view;

            this.listenTo(view, 'all', (eventName: any, ...args: any[]) => {
                this.trigger('item:' + eventName, view, model, ...args);
            });
        }

        // Renderizar y retornar la vista
        view.render();
        return view;
    }

    removeModel(model: BackboneModel) {
        const view = this.children[model.get('cid')] as PoderRowView;
        if (view) {
            // Remover del DataTable si está inicializado
            if (this.tableModule) {
                const row = this.tableModule.row(view.$el);
                if (row) {
                    row.remove().draw();
                }
            } else {
                // Remover del DOM directamente
                view.remove();
            }

            // Limpiar referencia
            this.children[model.get('cid')] = undefined;
        }
    }

    remove() {
        BackboneView.prototype.remove.call(this);
        if (this.subNavView) this.subNavView.remove();
        this.closeChildren();
    }

    closeChildren() {
        let children = this.children || {};
        _.each(children, (child: BackboneView) => this.closeChildView(child));
    }

    closeChildView(view: BackboneView) {
        if (!view) return;
        if (_.isFunction(view.remove)) {
            view.remove();
        }
        this.stopListening(view);
        if (view.model) {
            this.children[view.model.cid] = undefined;
        }
    }

    async removePoder(e: Event) {
        e.preventDefault();
        let target = this.$el.find(e.currentTarget);
        let documento = target.attr('data-code');
        let model = this.collection.get(parseInt(documento));

        this.app?.trigger('confirma', {
            message: 'Confirma que desea borrar el registro de poder',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.api) {
                            this.app?.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.api.delete(`/poderes/remover_poder/${documento}`) as any;

                        if (response && response.success) {
                            this.app?.trigger('success', response.msj);
                            this.collection.remove(model);
                            if (this.tableModule) {
                                this.tableModule.rows(target.parents('tr')).remove();
                                this.tableModule.draw();
                            }
                        } else {
                            this.app?.trigger('error', response?.msj || 'Error al eliminar el poder');
                        }
                    } catch (error: any) {
                        this.app?.trigger('error',
                            'Se detecta un error al eliminar el poder. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }
}
