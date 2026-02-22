import { BackboneView } from "@/common/Bone";
import HabilesRowView from "./HabilesRowView";
import tmp_listar_habiles from "@/componentes/habiles/templates/listar_habiles.hbs?raw";
import HabilesService from "@/pages/Habiles/EmpresaService";

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
            App: this.app,
            logger: this.logger
        });
    }

    initialize(): void {
        this.children = {};
        if (typeof this.listenTo === 'function') {
            this.listenTo(this.collection, 'add', this.addModel);
            this.listenTo(this.collection, 'remove', this.modelRemoved);
            this.listenTo(this.collection, 'reset', this.render);
        }
    }

    render(): this {
        this.$el.html(this.template());
        const filas = this.collection.map((model: any) => {
            let view = this.renderModel(model);
            return view.el;
        });
        this.$el.find('#show_data_habiles').append(filas);
        this.init_table();
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

    init_table(): void {
        const tableElement = this.$el.find('#tb_data_habiles');
        if (tableElement.length && typeof tableElement.DataTable === 'function') {
            this.tableModule = tableElement.DataTable({
                paging: true,
                pageLength: 10,
                pagingType: 'full_numbers',
                info: true,
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
                }
            });
        }
        this.$el.find('#tb_data_habiles').fadeIn();
    }

    addModel(model: any): void {
        const view = this.renderModel(model);
        this.$el.find('#show_data_habiles').append(view.$el);
    }

    renderModel(model: any): any {
        return new this.modelView({ model: model });
    }

    modelRemoved(): void {
        // Implementación para manejar la eliminación de modelos
    }
}
