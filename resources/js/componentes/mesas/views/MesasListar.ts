import { BackboneView } from "@/common/Bone";
import SubNavMesas from "./SubNavMesas";
import MesasService from "@/pages/Mesas/MesasService";
import DataTable from 'datatables.net-bs5';
import tmp_listar_mesas from "../templates/tmp_listar_mesas.hbs?raw";

interface MesasListarOptions {
    collection?: any;
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class MesasListar extends BackboneView {
    template: any;
    subNavMesas: SubNavMesas | null;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    mesasService: MesasService;

    constructor(options: MesasListarOptions) {
        super({ ...options, className: 'box', id: 'box_usuarios' });
        this.template = _.template(tmp_listar_mesas);
        this.subNavMesas = null;
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.mesasService = new MesasService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    initialize(): void {
        // Template ya está asignado en el constructor
    }

    get events(): Record<string, (e: Event) => void> {
        return {
            "click button[data-toggle='mostrar_mesa']": this.mostrarMesa,
            "click button[data-toggle='borrar_mesa']": this.borrarMesa,
        };
    }

    borrarMesa(e: Event): void {
        e.preventDefault();

        const target = $(e.currentTarget as HTMLElement);
        target.attr('disabled', 'true');
        const mesaId = target.attr('data-code') as string;

        if (!mesaId) {
            this.logger?.error('ID de mesa no encontrado');
            target.removeAttr('disabled');
            return;
        }

        if (this.App && typeof this.App.trigger === 'function') {
            this.App.trigger('confirma', {
                message: 'Se requiere de confirmar para borrar el registro seleccionado.',
                callback: async (status: boolean) => {
                    if (status) {
                        try {
                            // Delegar al servicio MesasService
                            const response = await this.mesasService.__removeMesa({ id: mesaId });

                            target.removeAttr('disabled');

                            if (response?.success) {
                                if (this.App && typeof this.App.trigger === 'function') {
                                    this.App.trigger('alert:success', {
                                        message: 'La operación se completó con éxito'
                                    });
                                }

                                setTimeout(() => {
                                    window.location.reload();
                                }, 1000);
                            } else {
                                if (this.App && typeof this.App.trigger === 'function') {
                                    this.App.trigger('alert:error', {
                                        message: response?.msj || 'Error al eliminar mesa'
                                    });
                                }
                            }
                        } catch (error: any) {
                            target.removeAttr('disabled');
                            this.logger?.error('Error al eliminar mesa:', error);
                            if (this.App && typeof this.App.trigger === 'function') {
                                this.App.trigger('alert:error', {
                                    message: 'Ocurrió un error al eliminar la mesa'
                                });
                            }
                        }
                    } else {
                        target.removeAttr('disabled');
                    }
                },
            });
        } else {
            target.removeAttr('disabled');
        }
    }

    mostrarMesa(e: Event): void {
        e.preventDefault();

        const mesa = $(e.currentTarget as HTMLElement).attr('data-code') as string;

        if (!mesa) {
            this.logger?.error('ID de mesa no encontrado');
            return;
        }

        if (this.App && this.App.router) {
            this.App.router.navigate('mostrar/' + mesa, { trigger: true, replace: true });
        }
    }

    render(): this {
        const template = _.template(this.template);
        const mesasData = this.collection ? this.collection.toJSON() : [];
        this.$el.html(template({ mesas: mesasData }));

        this.initTable();
        this.subNav();

        return this;
    }

    initTable(): void {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_mesas'), {
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
                { targets: 4, orderable: false, width: '15%' },
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

    subNav(): void {
        this.subNavMesas = new SubNavMesas({
            model: this.model,
            App: this.App,
            api: this.api,
            logger: this.logger,
            storage: this.storage,
            region: this.region,
            dataToggle: {
                listar: false,
                crear: true,
                editar: false,
            },
        });

        const subnavElement = this.$el.find('#showSubnav');
        if (subnavElement.length && this.subNavMesas) {
            subnavElement.html(this.subNavMesas.render().$el);
        }

        // Establecer referencia a la vista padre
        (SubNavMesas as any).parentView = this;
    }
}
