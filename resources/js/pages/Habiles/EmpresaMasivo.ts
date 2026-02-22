import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaMasivoView from "@/componentes/habiles/views/EmpresaMasivoView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";


export default class EmpresaMasivo extends Controller {

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
        this.listenTo(masivoView, 'file:upload', this.empresaService.__uploadMasivo);

        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(masivoView);
        }

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

        const subheaderRegion = layout.getRegion('subheader');
        if (subheaderRegion) {
            subheaderRegion.show(navView);
        }

        // Delegar exportaciones al service (por consistencia, aunque el menú o flags puedan ocultarlo)
        this.listenTo(navView, 'export:lista', this.empresaService.__exportLista);
        this.listenTo(navView, 'export:informe', this.empresaService.__exportInforme);
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
