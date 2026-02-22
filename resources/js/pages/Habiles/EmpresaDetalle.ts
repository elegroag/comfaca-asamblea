import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaDetalleView from "@/componentes/habiles/views/EmpresaDetalleView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";

export default class EmpresaDetalle extends Controller {

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
        this.empresaService.initEmpresas();

        if (typeof this.listenTo === 'function') {
            this.listenTo(this, 'set:empresas', this.empresaService.__setEmpresas);
            this.listenTo(this, 'add:empresa', this.empresaService.__addEmpresas);
        }
    }

    /**
     * Mostrar vista de detalles de empresa
     */
    detalleEmpresa(model: any): void {
        console.log('EmpresaDetalle.detalleEmpresa() called', model);

        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        // Configurar navegación
        const navView = new EmpresaNav({
            model: {
                titulo: 'Detalle empresa',
                listar: true,
                exportar: false,
                crear: true,
                editar: true,
                masivo: true,
            },
            router: this.router,
            api: this.api,
            App: this.App
        });

        const subheaderRegion = layout.getRegion('subheader');
        if (subheaderRegion) {
            subheaderRegion.show(navView);
        }
        // Delegar exportaciones al service
        this.listenTo(navView, 'export:lista', this.empresaService.__exportLista);
        this.listenTo(navView, 'export:informe', this.empresaService.__exportInforme);

        // Configurar vista principal
        const detalleView = new EmpresaDetalleView({ model: model, EmpresaModel: Empresa });
        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(detalleView);
        }

        // Establecer parent view para navegación
        if (EmpresaNav) {
            EmpresaNav.parentView = detalleView;
        }
    }

    /**
     * Destruir la vista
     */
    destroy(): void {
        console.log('EmpresaDetalle.destroy() called');
        this.region.remove();
        this.stopListening();

    }
}
