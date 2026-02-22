import { BackboneView } from "@/common/Bone";
import TrabajadorService from "@/pages/Trabajadores/TrabajadorService";
import TrabajadorRowView from "./TrabajadorRowView";
import listar from "@/componentes/trabajadores/templates/tmp_listar_trabajadores.hbs?raw";
import DataTable from "datatables.net-bs5";

interface TrabajadoresListarViewOptions {
    collection?: any;
    App?: any;
    api?: any;
    logger?: any;
    storage?: any;
    region?: any;
    [key: string]: any;
}

export default class TrabajadoresListarView extends BackboneView {
    template: any;
    modelView: any;
    collection: any;
    App: any;
    api: any;
    logger: any;
    storage: any;
    region: any;
    trabajadorService: TrabajadorService;

    constructor(options: TrabajadoresListarViewOptions) {
        super(options);
        this.App = options.App;
        this.api = options.api;
        this.logger = options.logger;
        this.storage = options.storage;
        this.region = options.region;
        this.collection = options.collection;
        this.template = _.template(listar);
        this.modelView = TrabajadorRowView;
        this.trabajadorService = new TrabajadorService({
            api: this.api,
            logger: this.logger,
            app: this.App
        });
    }

    get events() {
        return {
            "click button[data-toggle='mostrar_usuario']": 'mostrarUsuario',
        };
    }

    mostrarUsuario(e: Event) {
        e.preventDefault();
        const target = this.$el.find(e.currentTarget);
        const usuario = target.attr('data-code');
        if (this.App && this.App.router) {
            this.App.router.navigate('mostrar/' + usuario, { trigger: true, replace: true });
        }
    }

    render() {
        this.$el.html(this.template());
        const filas = this.collection.map((model: any) => {
            const view = this.renderModel(model);
            return view.el;
        });

        this.$el.find('#show_data_trabajadores').append(filas);

        this.initTable();

        return this;
    }

    initTable() {
        this.$el.find('#tb_data_trabajadores').DataTable({
            paging: true,
            pageLength: 10,
            pagingType: 'full_numbers',
            info: true,
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
        this.$el.find('#tb_data_trabajadores').fadeIn();
    }

    renderModel(model: any) {
        const view = new this.modelView({
            model: model,
            App: this.App,
            api: this.api,
            logger: this.logger,
            storage: this.storage,
            region: this.region
        });
        return view;
    }
}
