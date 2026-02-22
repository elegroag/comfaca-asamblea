import { BackboneView } from "@/common/Bone";
import CarteraRowView from "./CarteraRowView";
import SubNavCartera from "./SubNavCartera";
import Cartera from "@/models/Cartera";
import CarteraService from "@/pages/Cartera/CarteraService";
import DataTable from 'datatables.net-bs5';

import tmp_listar_cartera from "../templates/tmp_listar_cartera.hbs?raw";


interface CarterasListarOptions {
    collection?: any;
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
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
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    carteraService: CarteraService;

    constructor(options: CarterasListarOptions) {
        super({ ...options, className: 'box', id: 'box_poderes' });

        this.region = {
            tbody: '#tb_row_cartera',
        };
        this.tableModule = null;
        this.subNavCartera = null;
        this.children = [];
        this.modelView = CarteraRowView;
        this.template = _.template(tmp_listar_cartera);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;

        this.carteraService = new CarteraService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
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
        this.$el.html(this.template());

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
        if (this.app && this.app.router) {
            this.app.router.navigate('editar/' + id, { trigger: true });
        }
    }

    borrarCartera(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');
        const id = parseInt(target.attr('data-cid') || '0');
        const model = this.collection.get(id);

        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Confirma que desea borrar el registro de empresa en Cartera.',
                callback: (success: boolean) => {
                    if (success) {
                        this.trigger('remove:cartera', {
                            model: model,
                            callback: (response: any) => {
                                if (response) {
                                    if (this.app && typeof this.app.trigger === 'function') {
                                        this.app.trigger('alert:success', response.msj);
                                    }
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
    }

    exportData(e: Event): void {
        e.preventDefault();
        if (this.app && typeof this.app.trigger === 'function') {
            this.app.trigger('confirma', {
                message: 'Se requiere de confirmar si desea exportar la lista.',
                callback: async (success: boolean) => {
                    if (success) {
                        try {
                            // Delegar al servicio CarteraService
                            await this.carteraService.__exportLista();
                        } catch (error: any) {
                            this.logger?.error('Error al exportar lista:', error);
                            if (this.app && typeof this.app.trigger === 'function') {
                                this.app.trigger('alert:error', {
                                    message: error.message || 'Error al exportar lista'
                                });
                            }
                        }
                    }
                },
            });
        }
    }

    detalleCartera(e: Event): void {
        e.preventDefault();
        const target = $(e.currentTarget as HTMLElement);
        const id = target.attr('data-cid');
        if (this.app && this.app.router) {
            this.app.router.navigate('mostrar/' + id, { trigger: true, replace: true });
        }
    }

    initTable(): void {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_cartera'), {
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
                { targets: 5, orderable: false, width: '15%' },
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

    renderModel(model: Cartera): CarteraRowView {
        let view: CarteraRowView | undefined;
        const cid = model.get('cid');
        const index = this.children.indexOf(cid);

        if (index !== -1) {
            view = this.children[index];
        }

        if (!view) {
            view = new this.modelView({
                model: model,
                api: this.api,
                logger: this.logger,
                app: this.app,
                storage: this.storage,
                region: this.region
            });
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
