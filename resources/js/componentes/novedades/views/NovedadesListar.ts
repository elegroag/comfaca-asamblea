import { BackboneView } from "@/common/Bone";
import NovedadRow from "./NovedadRow";
import NovedadesService from "@/pages/Novedades/NovedadesService";
import DataTable from 'datatables.net-bs5';
import listar from "@/componentes/novedades/templates/listar.hbs?raw";

interface NovedadesListarOptions {
    collection?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class NovedadesListar extends BackboneView {
    App: any;
    subNavView: any;
    children: any;
    tableModule: any;
    modelView: any;
    template: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    novedadesService: NovedadesService;

    constructor(options: NovedadesListarOptions) {
        super(options);
        this.App = options.App || options.AppInstance;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.subNavView = undefined;
        this.children = {};
        this.tableModule = undefined;
        this.modelView = NovedadRow;
        this.template = _.template(listar);
        this.novedadesService = new NovedadesService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    get className() {
        return 'box';
    }

    initialize(): void {
        this.children = {};
        this.tableModule = null;
        this.modelView = NovedadRow;
        this.template = $('#tmp_listar').html();

        this.listenTo(this.collection, 'remove', this.removeModel);
        this.listenTo(this.collection, 'reset', this.render);
    }

    get events() {
        return {
            "click [data-toggle='row-show']": 'detalleNovedad',
            "click [data-toggle='row-remove']": 'removeNovedad',
            "click [data-toggle='row-send']": 'sendNovedad',
            'click #bt_procesar_all': 'procesarAll',
            'click #bt_actualiza': 'updateAll',
        };
    }

    /**
     * Procesar todas las novedades
     */
    procesarAll(e: Event): void {
        e.preventDefault();

        if (this.App) {
            this.App.trigger('confirma', {
                message: 'Confirma que desea procesar el registro',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('all:procesar', {
                            estado: 'A',
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        this.App.trigger('alert:success', response.msj);

                                        if (typeof download_file === 'function') {
                                            download_file(response);
                                        }
                                    } else {
                                        this.App.trigger('alert:error', response.msj);
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }

    /**
     * Actualizar todos los datos
     */
    updateAll(e: Event): void {
        e.preventDefault();

        if (this.App) {
            this.App.trigger('confirma', {
                message: 'Confirma que desea procesar la actualización de datos de empresas',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('all:update', {
                            estado: 'A',
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        this.App.trigger('alert:success', response.msj);

                                        if (typeof download_file === 'function') {
                                            download_file(response);
                                        }
                                    } else {
                                        this.App.trigger('alert:error', response.msj);
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }

    /**
     * Enviar novedad
     */
    sendNovedad(e: Event): void {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget);
        const id = target.attr('data-code');
        const model = this.collection.get(parseInt(id || '0'));

        if (this.App) {
            this.App.trigger('confirma', {
                message: 'Confirma que desea procesar el registro',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('item:procesar', {
                            model: model,
                            callback: (response: any) => {
                                if (response) {
                                    if (response.success) {
                                        this.App.trigger('alert:success', response.msj);

                                        if (typeof download_file === 'function') {
                                            download_file(response);
                                        }
                                    } else {
                                        this.App.trigger('alert:error', response.msj);
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }

    render(): this {
        const _template = _.template(this.template);
        this.$el.html(_template());

        const filas = this.collection.map((model: any) => {
            const view = this.renderModel(model);
            return view.$el;
        });

        this.$el.find('#show_rows').append(filas);
        this.initTable();
        return this;
    }

    /**
     * Mostrar detalle de novedad
     */
    detalleNovedad(e: Event): void {
        e.preventDefault();

        const id = this.$el.find(e.currentTarget).attr('data-code');

        if (this.App && this.App.router) {
            this.App.router.navigate('detalle/' + id, { trigger: true, replace: true });
        }
    }

    /**
     * Eliminar novedad
     */
    removeNovedad(e: Event): void {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget);
        const id = target.attr('data-code');
        const model = this.collection.get(parseInt(id || '0'));

        if (this.App) {
            this.App.trigger('confirma', {
                message: 'Confirma que desea borra la novedad',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('remove:row', {
                            model: model,
                            callback: (response: any) => {
                                if (response) {
                                    this.App.trigger('alert:success', response.msj);
                                    this.collection.remove(model);

                                    if (this.tableModule) {
                                        this.tableModule.row(target.parents('tr')).remove().draw();
                                    }
                                }
                            },
                        });
                    }
                },
            });
        }
    }

    /**
     * Inicializar tabla DataTables
     */
    private initTable(): void {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_novedades'), {
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
                { targets: 4, width: '15%' },
                { targets: 5, width: '15%' },
                { targets: 6, orderable: false, width: '15%' },
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

    /**
     * Renderizar modelo
     */
    private renderModel(model: any): any {
        let view: any;

        if (_.size(this.children) > 0) {
            if (_.indexOf(this.children, model.get('cid')) !== -1) {
                view = this.children[model.get('cid')];
            }
        }

        if (!view) {
            view = new this.modelView({ model: model });
            this.children[model.get('cid')] = view;
        }

        this.listenTo(view, 'all', (eventName: string) => {
            this.trigger('item:' + eventName, view, model);
        });

        view.render();
        return view;
    }

    /**
     * Eliminar modelo
     */
    private removeModel(model: any): void {
        const view = this.children[model.get('cid')];
        if (view) {
            view.remove();
            this.children[model.get('cid')] = undefined;
        }
    }

    remove(): void {
        // Llamar al método remove de la clase padre
        super.remove();

        if (this.subNavView) {
            this.subNavView.remove();
        }

        this.closeChildren();
    }

    /**
     * Cerrar vistas hijas
     */
    private closeChildren(): void {
        const children = this.children || {};
        _.each(children, (child: any) => this.closeChildView(child));
    }

    /**
     * Cerrar vista hija
     */
    private closeChildView(view: any): void {
        if (!view) return;

        if (_.isFunction(view.remove)) {
            view.remove();
        }

        this.stopListening(view);

        if (view.model) {
            this.children[view.model.cid] = undefined;
        }
    }
}
