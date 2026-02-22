import { BackboneView } from "@/common/Bone";
import DataTable from 'datatables.net-bs5';
import RechazoRowView from "./RechazoRowView";
import listar from "@/componentes/rechazos/templates/listar_rechazos.hbs?raw";

interface RechazoListarViewOptions {
    model?: any;
    collection?: any;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class RechazoListarView extends BackboneView {
    tableModule: any;
    children: any;
    modelView: any;
    template: any;
    collection: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;

    constructor(options: RechazoListarViewOptions) {
        super({
            ...options,
            events: {
                "click a[data-toggle='row-like']": 'likeRow',
                "click a[data-toggle='row-edit']": 'editRow',
                "click a[data-toggle='row-remove']": 'removeRow',
            },
            className: 'box',
        });
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.modelView = RechazoRowView;
        this.template = _.template(listar);
    }

    initialize() {
        this.children = {};
        this.listenTo(this.collection, 'add', this.addModel);
        this.listenTo(this.collection, 'remove', this.modelRemoved);
        this.listenTo(this.collection, 'reset', this.render);
    }

    render() {
        this.$el.html(this.template());
        const filas = this.collection.map((model: any) => {
            let view = this.renderModel(model);
            return view.el;
        });
        this.$el.find('#show_data_rechazos').append(filas);
        this.init_table();
        return this;
    }

    likeRow(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const nit = target.attr('data-cid');
        this.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('detalle/' + nit, { trigger: true, replace: true });
        }
    }

    editRow(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const nit = target.attr('data-cid');
        this.remove();
        if (this.app && this.app.router) {
            this.app.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    removeRow(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const nit = target.attr('data-cid');
        const model = this.collection.get(parseInt(nit));

        this.trigger('remove:rechazos', {
            model: model,
            callback: (response: any) => {
                if (response) {
                    this.collection.remove(model);
                    if (this.tableModule && target.parents('tr').length > 0) {
                        this.tableModule.row(target.parents('tr')).remove().draw();
                    }
                }
            },
        });
    }

    init_table() {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_rechazos'), {
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            columnDefs: [
                { targets: 0, width: '5%' },
                { targets: 1, width: '30%' },
                { targets: 2, width: '5%' },
                { targets: 3, width: '20%' },
                { targets: 4, width: '30%' },
                { targets: 5, width: '5%' },
                { targets: 6, searchable: false, width: '5%' },
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
        this.$el.find('#tb_data_rechazos').fadeIn();
    }

    addModel(model: any) {
        const view = this.renderModel(model);
        this.$el.find('#show_data_rechazos').append(view.$el);
    }

    modelRemoved() {
        // Método para manejar la eliminación de modelos
    }

    renderModel(model: any) {
        const view = new this.modelView({ model: model });
        return view;
    }
}
