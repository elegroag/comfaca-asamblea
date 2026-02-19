import { BackboneView } from "@/common/Bone";
import HabilesRowView from "./HabilesRowView";

declare global {
    var $: any;
    var _: any;
    var $App: any;
    var langDataTable: any;
    var CollectionView: any;
}

interface HabilesListarViewOptions {
    collection?: any;
    model?: any;
}

export default class HabilesListarView extends BackboneView {
    tableModule: any;
    children: any;
    modelView: typeof HabilesRowView;
    template: any;

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
        this.template = _.template(document.getElementById('tmp_listar_habiles')?.innerHTML || '');
        this.tableModule = null;
        this.children = {};
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
        if ($App.router) {
            $App.router.navigate('detalle/' + nit, { trigger: true, replace: true });
        }
    }

    editRow(e: Event): void {
        e.preventDefault();
        const nit = $(e.currentTarget as HTMLElement).attr('data-cid') as string;
        this.remove();
        if ($App.router) {
            $App.router.navigate('edita/' + nit, { trigger: true });
        }
    }

    removeRow(e: Event): void {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget as HTMLElement);
        const nit = target.attr('data-cid') as string;
        const model = this.collection.get(parseInt(nit));

        if (typeof this.trigger === 'function') {
            this.trigger('remove:habiles', {
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
                language: langDataTable,
            });
        }
        this.$el.find('#tb_data_habiles').fadeIn();
    }

    addModel(model: any): void {
        const view = this.renderModel(model);
        this.$el.find('#show_data_rechazos').append(view.$el);
    }

    renderModel(model: any): any {
        return new this.modelView({ model: model });
    }

    modelRemoved(): void {
        // Implementación para manejar la eliminación de modelos
    }
}
