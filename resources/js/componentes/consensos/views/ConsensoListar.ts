import { BackboneView } from "@/common/Bone";
import ConsensoService from "@/pages/Consensos/ConsensoService";
import listar from "../templates/listar.hbs?raw";
import DataTable from "datatables.net-bs5";

interface ConsensosListarOptions {
    collection?: any;
    model?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class ConsensosListar extends BackboneView {
    template: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    collection: any;
    tableModule: any;
    consensoService: ConsensoService;

    constructor(options: ConsensosListarOptions = {}) {
        super({ ...options, className: 'box', id: 'box_consensos' });
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.collection = options.collection;
        this.model = options.model;
        this.template = _.template(listar);
        this.tableModule = null;
        this.consensoService = new ConsensoService({
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
            "click button[data-toggle='editar_consenso']": this.editarConsenso,
            "click button[data-toggle='detalle_consenso']": this.detalleConsenso,
        };
    }

    editarConsenso(e: Event): void {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget);
        const consenso = target.attr('data-code');

        if (!consenso) {
            console.error('ID de consenso no encontrado');
            return;
        }

        if (this.App && this.App.router) {
            this.App.router.navigate('editar/' + consenso, { trigger: true, replace: true });
        }
    }

    detalleConsenso(e: Event): void {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget);
        const consenso = target.attr('data-code');

        if (!consenso) {
            console.error('ID de consenso no encontrado');
            return;
        }

        if (this.App && this.App.router) {
            this.App.router.navigate('consenso_detalle/' + consenso, { trigger: true, replace: true });
        }
    }

    render(): this {
        const template = _.template(this.template);
        const consensosData = this.collection ? this.collection.toJSON() : [];
        this.$el.html(template({ consensos: consensosData }));

        this.initTable();

        return this;
    }

    initTable(): void {
        const tableElement = this.$el.find('#tb_data_consensos');

        // Destruir tabla existente si hay una
        if (tableElement.length && tableElement.DataTable) {
            tableElement.DataTable().destroy();
        }

        if (tableElement.length) {
            this.tableModule = new DataTable(tableElement, {
                paging: true,
                pageLength: 10,
                pagingType: 'full_numbers',
                info: true,
                columnDefs: [
                    { targets: 0, width: '5%' },
                    { targets: 1, width: '30%' },
                    { targets: 2, width: '15%' },
                    { targets: 3, width: '15%' },
                    { targets: 4, width: '15%' },
                    { targets: 5, orderable: false, width: '10%' }
                ],
                order: [[1, 'desc']],
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
