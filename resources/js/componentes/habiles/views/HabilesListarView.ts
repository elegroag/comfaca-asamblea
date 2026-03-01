import { BackboneModel, BackboneView } from "@/common/Bone";
import HabilesRowView from "./HabilesRowView";
import tmp_listar_habiles from "@/componentes/habiles/templates/listar_habiles.hbs?raw";
import HabilesService from "@/pages/Habiles/EmpresaService";
import DataTable from 'datatables.net-bs5';

interface HabilesListarViewOptions {
    router?: { navigate: (fragment: string, options?: any) => void };
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class HabilesListarView extends BackboneView {
    tableModule: any;
    children: any;
    modelView: typeof HabilesRowView;
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    habilesService: HabilesService;
    private router?: { navigate: (fragment: string, options?: any) => void };

    constructor(options: HabilesListarViewOptions = {}) {
        super({
            ...options,
            events: {
                "click a[data-toggle='row-like']": 'likeRow',
                "click a[data-toggle='row-edit']": 'editRow',
                "click a[data-toggle='row-remove']": 'removeRow',
            },
            className: 'box',
        });
        this.modelView = HabilesRowView;
        this.template = _.template(tmp_listar_habiles);
        this.tableModule = null;
        this.children = {};
        this.router = options.router;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;

        // Inicializar el servicio con las dependencias
        this.habilesService = new HabilesService({
            api: this.api,
            app: this.app,
            logger: this.logger
        });
    }

    initialize(): void {

        this.children = {}; // Objeto de vistas
        this.tableModule = null;
        this.modelView = HabilesRowView;

        this.listenTo(this.collection, 'add', this.addModel);
        this.listenTo(this.collection, 'remove', this.modelRemoved);
        this.listenTo(this.collection, 'reset', this.render);
    }

    render(): this {

        const _template = _.template(tmp_listar_habiles);
        this.el.innerHTML = _template({ datatable: 'tb_data_habiles' });


        // Limpiar filas existentes y children
        this.$('#show_datatable').empty();
        this.closeChildren();

        // Renderizar cada modelo como una fila usando renderModel
        this.collection.forEach((model: any) => {
            const rowView = this.renderModel(model);
            this.$('#show_datatable').append(rowView.$el);
        });


        this.initTable();
        return this;
    }

    likeRow(e: Event): void {
        e.preventDefault();
        const nit = $(e.currentTarget as HTMLElement).attr('data-cid') as string;
        this.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('detalle/' + nit, { trigger: true, replace: true });
        }
    }

    editRow(e: Event): void {
        e.preventDefault();
        const nit = $(e.currentTarget as HTMLElement).attr('data-cid') as string;
        this.remove();
        if (this.router && typeof this.router.navigate === 'function') {
            this.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    removeRow(e: Event): void {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget as HTMLElement);
        const nit = target.attr('data-cid') as string;
        const model = this.collection.get(parseInt(nit));

        if (!model) {
            this.logger?.error('Modelo no encontrado para eliminar');
            return;
        }

        // Delegar al service para eliminar
        this.habilesService.__removeEmpresa({
            model: model,
            callback: (success: boolean, response?: any) => {
                if (success && response) {
                    this.collection.remove(model);
                    if (this.tableModule) {
                        this.tableModule.row(target.parents('tr')).remove().draw();
                    }
                    this.app?.trigger('alert:success', { message: 'Registro eliminado exitosamente' });
                } else {
                    this.app?.trigger('alert:error', { message: response?.msj || 'Error al eliminar registro' });
                }
            }
        });
    }

    initTable(): void {
        if (this.tableModule) {
            this.tableModule.destroy();
        }
        this.tableModule = new DataTable(this.$el.find('#tb_data_habiles'), {
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

    }

    addModel(model: any): void {
        const view = this.renderModel(model);
        this.$el.find('#show_data_habiles').append(view.$el);
    }

    renderModel(model: BackboneModel): any {
        let view: any;
        const cid = model.get('cid') || model.cid;

        if (_.size(this.children) > 0 && this.children[cid]) {
            view = this.children[cid];
        }

        if (!view) {
            view = new this.modelView({ model: model });
            this.children[cid] = view;
        }

        this.listenTo(view, 'all', (eventName: string) => {
            this.trigger('item:' + eventName, view, model);
        });

        view.render();
        return view;
    }

    closeChildren() {
        Object.keys(this.children).forEach((key: string) => {
            const child = this.children[key];
            this.closeChildView(child);
        });
        this.children = {}; // Limpiar el objeto
    }

    modelRemoved(): void {
        // Implementación para manejar la eliminación de modelos
    }
}
