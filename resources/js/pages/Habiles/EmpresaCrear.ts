import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaCrearView from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";

export default class EmpresaCrear extends Controller {

    public empresaService: EmpresaService;

    constructor(options: any) {
        super(options)
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            api: this.api,
            App: this.App,
            logger: this.logger,
            EmpresaModel: Empresa
        });

        this.listenTo(this, 'set:empresas', this.empresaService.__setEmpresas);
        this.listenTo(this, 'add:empresa', this.empresaService.__addEmpresas);
    }

    /**
     * Mostrar vista de creación de empresa
     */
    crearEmpresa(): void {
        console.log('EmpresaCrear.crearEmpresa() called');

        const layout = new LayoutView();
        this.region.show(layout);

        // Inicializar colección de empresas
        this.empresaService.initEmpresas();

        // Cargar datos si la colección está vacía
        this.empresaService.__findAll();

        // Configurar vista principal
        const crearView = new EmpresaCrearView({
            EmpresaModel: Empresa,
            collection: this.empresaService.Collections.empresas,
            api: this.api,
            App: this.App,
            router: this.router
        });


        this.listenTo(crearView, 'form:save', this.empresaService.__saveEmpresa);
        this.listenTo(crearView, 'add:empresas', this.empresaService.__addEmpresas);
        this.listenTo(crearView, 'set:empresas', this.empresaService.__setEmpresas);
        this.listenTo(crearView, 'notify', this.empresaService.__notifyPlataforma);


        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(crearView);
        }

        // Establecer parent view para navegación
        if (EmpresaNav) {
            EmpresaNav.parentView = crearView;
        }

        // Configurar navegación
        const navView = new EmpresaNav({
            model: {
                titulo: 'Crear empresa',
                listar: true,
                exportar: false,
                crear: false,
                editar: false,
                masivo: true,
            },
            api: this.api,
            App: this.App,
            router: this.router
        });

        const subheaderRegion = layout.getRegion('subheader');
        if (subheaderRegion) {
            subheaderRegion.show(navView);
        }
    }

    /**
     * Destruir la vista
     */
    destroy(): void {
        console.log('EmpresaCrear.destroy() called');
        this.region.remove();
        this.stopListening();
    }
}
