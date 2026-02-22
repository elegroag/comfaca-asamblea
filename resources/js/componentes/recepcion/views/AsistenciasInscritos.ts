import { BackboneView } from "@/common/Bone";
import DataTable from 'datatables.net-bs5';
import listar_inscritos from "@/componentes/recepcion/templates/listar_inscritos.hbs?raw";

interface AsistenciasInscritosOptions {
    collection?: any;
    estado?: string;
    app?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class AsistenciasInscritos extends BackboneView {
    template: any;
    app: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    estado: string;
    tableModule: any;

    constructor(options: AsistenciasInscritosOptions = {}) {
        super({ ...options, id: 'box_ingresados', tagName: 'div', className: 'box' });
        this.app = options.app;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.estado = options.estado || '';
        this.template = _.template(listar_inscritos);
    }

    initialize(options: AsistenciasInscritosOptions) {
        this.estado = options.estado || '';
    }

    events() {
        return {};
    }

    render() {
        const _template = _.template(this.template);
        this.$el.html(
            _template({
                asistencias: this.collection.toJSON(),
                titulo: this.estado == 'P' ? 'Lista inscritos' : 'Pendientes de pre-registro',
            })
        );
        this.initTable();
        return this;
    }

    initTable() {
        // Destruir tabla existente si hay una
        if (this.tableModule) {
            this.tableModule.destroy();
        }

        this.tableModule = new DataTable(this.$el.find('#tb_data_inscritos'), {
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
            searching: true,
            ordering: true,
            autoWidth: false,
            columns: [
                { data: 'empleador' },
                { data: 'cedrep' },
                { data: 'clave_ingreso' },
                { data: 'asamblea_id' },
                { data: 'fecha' },
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
