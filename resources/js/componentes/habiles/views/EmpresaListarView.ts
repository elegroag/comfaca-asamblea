import { BackboneView } from "@/common/Bone";
import EmpresaRowView from "./EmpresaRowView";
import DataTable from 'datatables.net-bs5';

interface EmpresaListarViewOptions {
    router?: { navigate: (fragment: string, options?: any) => void };
    [key: string]: any;
}


export default class EmpresaListarView extends BackboneView {
    tableModule: any;
    children: any[];
    modelView: typeof EmpresaRowView;
    template: any;
    private router?: { navigate: (fragment: string, options?: any) => void };

    constructor(options: EmpresaListarViewOptions = {}) {
        super({
            ...options,
            className: 'box',
        });
        this.modelView = EmpresaRowView;
        this.children = new Array();
        this.tableModule = null;
        this.template = _.template(document.getElementById('tmp_listar_empresas')?.innerHTML || '');
        this.router = options.router;
    }

    initialize(): void {
        if (typeof this.listenTo === 'function') {
            this.listenTo(this.collection, 'add', this.addModel);
            this.listenTo(this.collection, 'remove', this.removeModel);
            this.listenTo(this.collection, 'reset', this.render);
        }
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
        this.$el.html(this.template());

        const filas = this.collection.map((model: any) => {
            const view = this.renderModel(model);
            return view.$el;
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

        if (typeof this.trigger === 'function') {
            this.trigger('remove:empresa', {
                model: model,
                callback: (response: any) => {
                    if (response) {
                        this.collection.remove(model);
                        if (this.tableModule) {
                            this.tableModule.row(target.parents('tr')).remove().draw();
                        }
                    }
                },
            });
        }
    }

    init_table(): void {
        // Destruir tabla existente si hay una
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

    renderModel(model: any): any {
        return new this.modelView({ model: model });
    }
}
