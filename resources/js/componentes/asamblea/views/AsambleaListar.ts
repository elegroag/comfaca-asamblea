import { BackboneView } from "@/common/Bone";
import listar from "@/componentes/asamblea/templates/tmp_list_asambleas.hbs?raw";
import DataTable from "datatables.net-bs5";
import AsambleaService from "@/pages/Asamblea/AsambleaService";

interface AsambleaListarOptions {
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsambleaListar extends BackboneView {
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    collection: any;
    asambleaService: AsambleaService;

    constructor(options: AsambleaListarOptions = {}) {
        super(options);
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.collection = options.collection;
        this.template = _.template(listar);

        // Inicializar el servicio con las dependencias
        this.asambleaService = new AsambleaService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(): void {
        // Template ya asignado en el constructor
    }

    render(): this {
        const template = _.template(this.template);
        const asambleasData = this.collection ? this.collection.toJSON() : [];
        this.$el.html(
            template({
                asambleas: asambleasData,
            })
        );
        this.initTable();
        return this;
    }

    get events() {
        return {
            'click #bt_back': this.back,
            "click [data-toggle='mostrar_asamblea']": this.mostrar_asamblea,
        };
    }

    /**
     * Mostrar detalle de asamblea
     */
    mostrar_asamblea(e: Event): void {
        e.preventDefault();
        this.remove();
        const target = this.$el.find(e.currentTarget);
        const id = target.attr('data-code');

        if (!id) {
            this.logger?.error('ID de asamblea no encontrado');
            return;
        }

        if (this.app && this.app.router) {
            this.app.router.navigate('asamblea_detalle/' + id, { trigger: true, replace: true });
        }
    }

    /**
     * Volver a la vista anterior
     */
    back(e: Event): void {
        e.preventDefault();
        this.remove();

        if (this.app && this.app.router) {
            this.app.router.navigate('asamblea', { trigger: true, replace: true });
        }
    }

    /**
     * Inicializar tabla DataTables
     */
    private initTable(): void {
        const tableElement = this.$el.find('#tb_data_asambleas');

        // Destruir tabla existente si hay una
        if (tableElement.length && tableElement.DataTable) {
            tableElement.DataTable().destroy();
        }

        if (tableElement.length) {
            new DataTable(tableElement, {
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
                },
                destroy: true
            });
        }
    }
}
