import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaMasivoView from "@/componentes/habiles/views/EmpresaMasivoView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";


export default class EmpresaMasivo extends Controller {

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
     * Mostrar vista de cargue masivo
     */
    cargueMasivo(): void {
        console.log('EmpresaMasivo.cargueMasivo() called');

        const layout = new LayoutView();
        this.region.show(layout);

        // Inicializar colección de empresas
        this.empresaService.initEmpresas();

        // Cargar datos si la colección está vacía
        this.empresaService.__findAll();

        // Configurar vista principal
        const masivoView = new EmpresaMasivoView({
            collection: this.empresaService.Collections.empresas,
            router: this.router,
            api: this.api,
            App: this.App
        });

        this.listenTo(masivoView, 'form:save', this.empresaService.__saveEmpresa);

        layout.getRegion('body').show(masivoView);

        // Establecer parent view para navegación
        if (EmpresaNav) {
            EmpresaNav.parentView = masivoView;
        }

        // Configurar navegación
        const navView = new EmpresaNav({
            model: {
                titulo: 'Cargue masivo empresa',
                listar: true,
                exportar: false,
                crear: true,
                editar: false,
                masivo: false,
            },
            router: this.router,
            api: this.api,
            App: this.App
        });

        layout.getRegion('subheader').show(navView);
    }

    /**
     * Destruir la vista
     */
    destroy(): void {
        console.log('EmpresaMasivo.destroy() called');
        this.region.remove();
        this.stopListening();
    }
}
