import { BackboneView } from "@/common/Bone";
import tmp_listar_consensos from "@/componentes/consensos/templates/tmp_listar_consensos.hbs?raw";
import ConsensoService from "@/pages/Consensos/ConsensoService";

interface ConsensosListarOptions {
    collection?: any;
    model?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
}

export default class ConsensosListar extends BackboneView {
    template: string;
    tableModule: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    consensoService: ConsensoService;

    constructor(options: ConsensosListarOptions = {}) {
        super({ ...options, className: 'box', id: 'box_consensos' });
        this.template = tmp_listar_consensos;
        this.tableModule = null;
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;

        // Inicializar el servicio con las dependencias
        this.consensoService = new ConsensoService({
            api: this.api,
            logger: this.logger,
            app: this.app
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

        const consenso = $(e.currentTarget as HTMLElement).attr('data-code') as string;

        if (!consenso) {
            this.logger?.error('ID de consenso no encontrado');
            return;
        }

        if (this.app?.router) {
            this.app.router.navigate('editar/' + consenso, { trigger: true, replace: true });
        }
    }

    detalleConsenso(e: Event): void {
        e.preventDefault();

        const consenso = $(e.currentTarget as HTMLElement).attr('data-code') as string;

        if (!consenso) {
            this.logger?.error('ID de consenso no encontrado');
            return;
        }

        if (this.app?.router) {
            this.app.router.navigate('consenso_detalle/' + consenso, { trigger: true, replace: true });
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

        if (tableElement.length && typeof tableElement.DataTable === 'function') {
            this.tableModule = tableElement.DataTable({
                paging: true,
                pageLength: 10,
                pagingType: 'full_numbers',
                info: true,
                columnDefs: [{ targets: 0 }, { targets: 1 }, { targets: 2 }, { targets: 3, orderable: false }],
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
                }
            });
        }
    }
}
