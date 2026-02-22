import { BackboneView } from "@/common/Bone";
import RepresentanteService from "@/pages/Representantes/RepresentanteService";
import RepresentanteRow from "./RepresentanteRow";
import listar from "@/componentes/representantes/templates/tmp_listar.hbs?raw";
import DataTable from "datatables.net-bs5";

interface RepresentanteListarOptions {
    collection?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RepresentanteListar extends BackboneView {
    subNavView: any;
    children: any;
    tableModule: any;
    template: any;
    modelView: any;
    model: any;
    collection: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    representanteService: RepresentanteService;

    constructor(options: RepresentanteListarOptions) {
        super({ ...options, className: 'box', id: 'box_representantes' });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.collection = options.collection;
        this.template = _.template(listar);
        this.modelView = RepresentanteRow;
        this.representanteService = new RepresentanteService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    initialize() {
        this.children = {};
        this.tableModule = null;
        this.subNavView = null;

        this.listenTo(this.collection, 'add', this.addModel);
        this.listenTo(this.collection, 'remove', this.removeModel);
        this.listenTo(this.collection, 'reset', this.render);
    }

    render() {
        const template = _.template(this.template);
        this.$el.html(template());

        const filas = this.collection.map((model: any) => {
            const view = this.renderModel(model);
            return view.$el;
        });
        this.$el.find('#show_data_rows').append(filas);
        this.initTable();
        this.subNav();
        return this;
    }

    get events() {
        return {
            "click [data-toggle='row-like']": 'mostrarRow',
            "click [data-toggle='row-edit']": 'editarRow',
            "click [data-toggle='row-remove']": 'removeRow',
        };
    }

    mostrarRow(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const cedrep = target.attr('data-code');
        if (this.App && this.App.router) {
            this.App.router.navigate('mostrar/' + cedrep, { trigger: true, replace: true });
        }
    }

    editarRow(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const cedrep = target.attr('data-code');
        if (this.App && this.App.router) {
            this.App.router.navigate('editar/' + cedrep, { trigger: true, replace: true });
        }
    }

    removeRow(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const cedrep = target.attr('data-code');

        const model = this.collection.get(parseInt(cedrep));
        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: '¡Confirma que desea borrar el registro!',
                callback: (status: boolean) => {
                    if (status) {
                        this.trigger('remove:representante', {
                            model: model,
                            responseTransaction: (response: any) => {
                                if (response) {
                                    this.collection.remove(model);
                                    if (this.tableModule && target.parents('tr').length > 0) {
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

    initTable() {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_representantes'), {
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            columnDefs: [
                { targets: 0, width: '20%' },
                { targets: 1, width: '40%' },
                { targets: 2, width: '20%' },
                { targets: 3, width: '10%' },
                { targets: 4, orderable: false, width: '10%' },
            ],
            order: [[1, 'desc']],
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

    subNav() {
        // Implementación básica de subNav sin dependencias externas
        this.$el.find('#showSubnav').html('<div class="subnav-placeholder"></div>');
    }

    addModel(model: any) {
        const view = this.renderModel(model);
        this.$el.find('#show_data_rows').append(view.$el);
    }

    renderModel(model: any) {
        let view: any;
        if (Object.keys(this.children).length > 0) {
            if (Object.values(this.children).includes(model.get('cid'))) {
                view = this.children[model.get('cid')];
            }
        }
        if (!view) {
            view = new this.modelView({ model: model });
            this.children[model.get('cid')] = view;
        }
        view.render();
        return view;
    }

    removeModel(model: any) {
        if (this.children[model.get('cid')]) {
            this.children[model.get('cid')].remove();
            delete this.children[model.get('cid')];
        }
    }

    remove() {
        this.closeChildren();
        if (this.subNavView) this.subNavView.remove();
        super.remove();
    }

    closeChildren() {
        const children = this.children || {};
        Object.values(children).forEach((child: any) => this.closeChildView(child));
    }

    closeChildView(view: any) {
        if (!view) return;
        if (typeof view.remove === 'function') {
            view.remove();
        }
        this.stopListening(view);
        if (view.model) {
            this.children[view.model.cid] = undefined;
        }
    }
}
