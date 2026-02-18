import { BackboneModel, BackboneView } from "@/common/Bone";
import PoderRowView from "./PoderRowView";
import listarPoderes from "@/componentes/poderes/templates/listarPoderes.hbs?raw";
import { capitalize } from "@/core/Utils";
import DataTable from 'datatables.net-bs5';
import PoderesController from "@/pages/Poderes/PoderesController";

export default class PoderesListarView extends BackboneView {
    App: PoderesController;
    tableModule: any | null;
    subNavView: any;
    children: any[];
    modelView: typeof PoderRowView;

    constructor(options: any) {
        super(options);
        this.App = options.App || null;
        this.tableModule = null;
        this.children = [];
        this.modelView = PoderRowView;
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
        this.$el.html(_template({
            datatable: 'tb_data_poderes'
        }));

        const filas = this.collection.map((model: any) => {
            model.set('capitalize', (str: string) => capitalize(str));
            let view = this.renderModel(model);
            return view.$el;
        });

        this.$el.find('#show_data_poderes').append(filas);

        this.initTable();
        return this;
    }

    async actaPoderes(e: Event) {
        e.preventDefault();
        this.App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea generar el Acta.',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.App.api) {
                            this.App.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.App.api.get('/poderes/actaRevisionVerificacionPoderes') as any;

                        if (response && response.success) {
                            this.App.trigger('download_file', response);
                        } else {
                            this.App.trigger('error', response?.msj || 'Error al generar el acta');
                        }
                    } catch (error: any) {
                        this.App.trigger('alert:error',
                            'Se detecta un error al exportar los datos. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }

    async informeData(e: Event) {
        e.preventDefault();
        this.App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea generar el informe.',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.App.api) {
                            this.App.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.App.api.get('/poderes/exportar_pdf') as any;

                        if (response && response.success) {
                            this.App.trigger('download_file', response);
                        } else {
                            this.App.trigger('error', response?.msj || 'Error al generar el informe');
                        }
                    } catch (error: any) {
                        this.App.trigger('alert:warning',
                            'Se detecta un error al exportar los datos. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }

    async exportData(e: Event) {
        e.preventDefault();
        this.App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea exportar la lista.',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.App.api) {
                            this.App.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.App.api.get('/poderes/exportar_lista') as any;

                        if (response && response.success) {
                            this.App.trigger('download_file', response);
                        } else {
                            this.App.trigger('error', response?.msj || 'Error al exportar la lista');
                        }
                    } catch (error: any) {
                        this.App.trigger('warning',
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
        this.App.router.navigate('mostrar/' + documento, { trigger: true, replace: true });
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
        let view = this.renderModel(model);
        this.$el.find('#show_data_poderes').append(view.$el);
    }

    renderModel(model: BackboneModel) {
        let view;
        if (_.size(this.children) > 0) {
            if (_.indexOf(this.children, model.get('cid')) != -1) {
                view = this.children[model.get('cid')];
            }
        }
        if (!view) {
            view = new this.modelView({ model: model });
            this.children[model.get('cid')] = view;
        }

        this.listenTo(view, 'all', (eventName: any) => {
            this.trigger('item:' + eventName, view, model);
        });

        view.render();
        return view;
    }

    removeModel(model: BackboneModel) {
        let view = this.children[model.get('cid')];
        if (view) {
            view.remove();
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

        this.App.trigger('confirma', {
            message: 'Confirma que desea borrar el registro de poder',
            callback: async (status: boolean) => {
                if (status) {
                    try {
                        if (!this.App.api) {
                            this.App.trigger('error', 'API no disponible');
                            return;
                        }

                        const response = await this.App.api.delete(`/poderes/remover_poder/${documento}`) as any;

                        if (response && response.success) {
                            this.App.trigger('success', response.msj);
                            this.collection.remove(model);
                            if (this.tableModule) {
                                this.tableModule.rows(target.parents('tr')).remove();
                                this.tableModule.draw();
                            }
                        } else {
                            this.App.trigger('error', response?.msj || 'Error al eliminar el poder');
                        }
                    } catch (error: any) {
                        this.App.trigger('error',
                            'Se detecta un error al eliminar el poder. Comunicar a soporte técnico'
                        );
                    }
                }
            },
        });
    }
}
