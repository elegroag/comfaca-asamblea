import { BackboneView } from "@/common/Bone";
import InterventorService from "@/pages/Interventores/InterventorService";
import listar from "@/componentes/interventores/templates/listar.hbs?raw";
import DataTable from "datatables.net-bs5";

interface InterventoresListarOptions {
    collection?: any;
    api?: any;
    logger?: any;
    app?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class InterventoresListar extends BackboneView {
    template: any;
    api: any;
    logger: any;
    app: any;
    storage: any;
    region: any;
    collection: any;
    interventorService: InterventorService;

    constructor(options: InterventoresListarOptions = {}) {
        super({ ...options, className: 'box', id: 'box_interventores' });
        this.api = options.api;
        this.logger = options.logger;
        this.app = options.app;
        this.storage = options.storage;
        this.region = options.region;
        this.collection = options.collection;
        this.template = _.template(listar);
        this.interventorService = new InterventorService({
            api: this.api,
            logger: this.logger,
            app: this.app
        });
    }

    initialize(): void {
        // Inicialización si es necesaria
    }

    get events() {
        return {
            "click button[data-toggle='mostrar_usuario']": this.mostrar_usuario,
        };
    }

    /**
     * Mostrar detalle de usuario
     */
    mostrar_usuario(e: Event): void {
        e.preventDefault();

        const target = this.$el.find(e.currentTarget);
        const usuario = target.attr('data-code');

        if (!usuario) {
            this.logger?.error('ID de usuario no encontrado');
            return;
        }

        if (this.app && this.app.router) {
            this.app.router.navigate('mostrar/' + usuario, { trigger: true, replace: true });
        }
    }

    render(): this {
        const template = _.template(this.template);
        const interventoresData = this.collection ? this.collection.toJSON() : [];
        this.$el.html(template({ interventores: interventoresData }));
        this.initTable();
        return this;
    }

    /**
     * Inicializar tabla DataTables
     */
    private initTable(): void {
        const tableElement = this.$el.find('#tb_data_usuarios');

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
                columnDefs: [{ targets: 0 }, { targets: 1 }, { targets: 2 }, { targets: 3 }],
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
