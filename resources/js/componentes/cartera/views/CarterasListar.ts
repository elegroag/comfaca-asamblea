import { BackboneView } from "@/common/Bone";
import CarteraRowView from "./CarteraRowView";
import SubNavCartera from "./SubNavCartera";
import Cartera from "@/models/Cartera";

import tmp_listar_cartera from "../templates/tmp_listar_cartera.hbs?raw";

declare global {
    var $App: any;
    var create_url: (path: string) => string;
    var download_file: (response: any) => void;
    var langDataTable: any;
}

interface CarterasListarOptions {
    collection?: any;
    model?: any;
}

class CarterasListar extends BackboneView {
    region: {
        tbody: string;
    };
    tableModule: any;
    subNavCartera: SubNavCartera | null;
    subNavView: any;
    children: any[];
    modelView: typeof CarteraRowView;
    template: string;

    constructor(options: CarterasListarOptions) {
        super({ ...options, className: 'box', id: 'box_poderes' });

        this.region = {
            tbody: '#tb_row_cartera',
        };
        this.tableModule = null;
        this.subNavCartera = null;
        this.children = [];
        this.modelView = CarteraRowView;
        this.template = tmp_listar_cartera;
    }

    initialize(): void {
        this.listenTo(this.collection, 'add', this.addModel);
        this.listenTo(this.collection, 'remove', this.removeModel);
        this.listenTo(this.collection, 'reset', this.render);
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            'click #bt_export_data': this.exportData,
            "click [data-toggle='bt_detalle']": this.detalleCartera,
            "click [data-toggle='bt_borrar']": this.borrarCartera,
            "click [data-toggle='bt_editar']": this.editaCartera,
        };
    }

    render(): CarterasListar {
        const template = _.template(this.template);
        this.$el.html(template());

        const filas = this.collection.map((cartera: Cartera) => {
            const view = this.renderModel(cartera);
            return (view as any).$el;
        });

        this.$el.find(this.region.tbody).append(filas);
        this.initTable();
        this.subNav();
        return this;
    }

    editaCartera(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');
        const id = parseInt(target.attr('data-cid') || '0');
        this.remove();
        $App.router.navigate('editar/' + id, { trigger: true });
    }

    borrarCartera(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');
        const id = parseInt(target.attr('data-cid') || '0');
        const model = this.collection.get(id);

        $App.trigger('confirma', {
            message: 'Confirma que desea borrar el registro de empresa en Cartera.',
            callback: (success: boolean) => {
                if (success) {
                    this.trigger('remove:cartera', {
                        model: model,
                        callback: (response: any) => {
                            if (response) {
                                $App.trigger('alert:success', response.msj);
                                this.removeModel(model);
                                this.tableModule.row(target.parents('tr')).remove().draw();
                            }
                            target.removeAttr('disabled');
                        },
                    });
                } else {
                    target.removeAttr('disabled');
                }
            },
        });
    }

    exportData(e: Event): void {
        e.preventDefault();
        $App.trigger('confirma', {
            message: 'Se requiere de confirmar si desea exportar la lista.',
            callback: (success: boolean) => {
                if (success) {
                    const url = create_url('cartera/exportar_lista');
                    $App.trigger('syncro', {
                        url,
                        data: {},
                        callback: (response: any) => {
                            if (response?.success) {
                                download_file(response);
                            } else {
                                $App.trigger('error', response?.msj || 'Error al exportar');
                            }
                        },
                    });
                }
            },
        });
    }

    detalleCartera(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        const id = target.attr('data-cid');
        $App.router.navigate('mostrar/' + id, { trigger: true, replace: true });
    }

    initTable(): void {
        this.tableModule = this.$el.find('#tb_data_cartera').DataTable({
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            columnDefs: [
                { targets: 0 },
                { targets: 1 },
                { targets: 2 },
                { targets: 3 },
                { targets: 4 },
                { targets: 5, orderable: false },
            ],
            language: langDataTable,
        });
    }

    renderModel(model: Cartera): CarteraRowView {
        let view: CarteraRowView | undefined;
        const cid = model.get('cid');
        const index = this.children.indexOf(cid);

        if (index !== -1) {
            view = this.children[index];
        }

        if (!view) {
            view = new this.modelView({ model: model });
            this.children.push(view);
        }

        (view as any).render();
        return view;
    }

    addModel(model: Cartera): void {
        const view = this.renderModel(model);
        this.$el.find(this.region.tbody).append((view as any).$el);
    }

    removeModel(model: Cartera): void {
        const cid = model.get('cid');
        const index = this.children.indexOf(cid);
        if (index !== -1) {
            const view = this.children[index];
            view.remove();
            this.children.splice(index, 1);
        }
    }

    remove(): CarterasListar {
        (Backbone as any).View.prototype.remove.call(this);
        if (this.subNavView) this.subNavView.remove();
        this.closeChildren();
        if (this.subNavCartera) this.subNavCartera.remove();
        return this;
    }

    closeChildren(): void {
        this.children.forEach((child: any) => this.closeChildView(child));
        this.children = [];
    }

    closeChildView(view: any): void {
        if (!view) return;
        if (_.isFunction(view.remove)) {
            view.remove();
        }
        this.stopListening(view);
        if (view.model) {
            const index = this.children.indexOf(view);
            if (index !== -1) {
                this.children.splice(index, 1);
            }
        }
    }

    subNav(): void {
        this.subNavCartera = new SubNavCartera({
            model: this.model,
            dataToggle: {
                listar: false,
                crear: true,
                editar: false,
                masivo: true,
                exportar: true,
            },
        }).render();
        this.$el.find('#showSubnav').html((this.subNavCartera as any).$el);
        (SubNavCartera as any).parentView = this;
    }
}

export default CarterasListar;
