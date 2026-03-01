import { BackboneModel, BackboneView } from "@/common/Bone";
import EmpresaRowView from "./EmpresaRowView";
import DataTable from 'datatables.net-bs5';
import EmpresaService from "@/pages/Habiles/EmpresaService";
import tmp_listar_empresas from "../templates/listar_empresas.hbs?raw";

interface EmpresaListarViewOptions {
    router?: { navigate: (fragment: string, options?: any) => void };
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}


export default class EmpresaListarView extends BackboneView {
    tableModule: any;
    children: any[];
    modelView: typeof EmpresaRowView;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    empresaService: EmpresaService;
    private router?: { navigate: (fragment: string, options?: any) => void };

    constructor(options: EmpresaListarViewOptions = {}) {
        super({
            ...options,
            className: 'box',
        });
        this.modelView = EmpresaRowView;
        this.children = new Array();
        this.tableModule = null;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.router = options.router;

        // Inicializar el servicio con las dependencias
        this.empresaService = new EmpresaService({
            api: this.api,
            app: this.app,
            logger: this.logger
        });
    }

    initialize() {

        this.children = []; // Array de vistas
        this.tableModule = null;
        this.modelView = EmpresaRowView;

        this.listenTo(this.collection, 'add', this.addModel);
        this.listenTo(this.collection, 'remove', this.removeModel);
        this.listenTo(this.collection, 'reset', this.render);
    }

    /**
     * @override
     */
    get events(): Record<string, (e: Event) => void> {
        return {
            "click a[data-toggle='row-like']": this.likeRow,
            "click a[data-toggle='row-edit']": this.editRow,
            "click a[data-toggle='row-remove']": this.removeRow,
        };
    }

    render(): this {

        console.log('rendering empresa listar view', this.collection);

        const _template = _.template(tmp_listar_empresas);
        this.el.innerHTML = _template({ datatable: 'tb_data_empresas' });


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
        this.empresaService.__removeEmpresa({
            model: model,
            callback: (success: boolean, response?: any) => {
                if (success && response) {
                    this.collection.remove(model);
                    if (this.tableModule) {
                        this.tableModule.row(target.parents('tr')).remove().draw();
                    }
                    this.app?.trigger('alert:success', { message: 'Empresa eliminada exitosamente' });
                } else {
                    this.app?.trigger('alert:error', { message: response?.msj || 'Error al eliminar empresa' });
                }
            }
        });
    }

    initTable(): void {
        if (this.tableModule) {
            this.tableModule.destroy();
        }
        this.tableModule = new DataTable(this.$el.find('#tb_data_empresas'), {
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            columnDefs: [
                { targets: 0, width: '5%' },
                { targets: 1, width: '20%' },
                { targets: 2, width: '10%' },
                { targets: 3, width: '25%' },
                { targets: 4, width: '10%' },
                { targets: 5, width: '25%' },
                { targets: 6, searchable: false, width: '10%' },
            ],
            lengthMenu: [
                [10, 25, 50, -1],
                [10, 25, 50, 'All'],
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

    removeModel(model: any): void {
        const view = this.children[model.get('cid')];
        if (view) {
            view.remove();
            this.children[model.get('cid')] = undefined;
        }
    }

    renderModel(model: BackboneModel): any {
        let view: any;
        if (_.size(this.children) > 0) {
            if (_.indexOf(this.children, model.get('cid')) != -1) {
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

    closeChildren() {
        this.children.forEach((child: any) => {
            this.closeChildView(child);
        });
        this.children = []; // Limpiar el array
    }
}
