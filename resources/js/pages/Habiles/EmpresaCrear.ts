import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaCrearView from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";

export default class EmpresaCrear extends Controller {

    public empresaService: EmpresaService;

    constructor(options: any) {
        super(options)
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            router: this.router,
            api: this.api,
            App: this.App
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
            collection: this.empresaService.Collections.empresas,
            api: this.api,
            App: this.App,
            router: this.router
        });


        this.listenTo(crearView, 'form:save', this.empresaService.__saveEmpresa);
        this.listenTo(crearView, 'add:empresas', this.empresaService.__addEmpresas);
        this.listenTo(crearView, 'set:empresas', this.empresaService.__setEmpresas);
        this.listenTo(crearView, 'notify', this.empresaService.__notifyPlataforma);


        layout.getRegion('body').show(crearView);

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

        layout.getRegion('subheader').show(navView);
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
