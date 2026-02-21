import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaDetalleView from "@/componentes/habiles/views/EmpresaDetalleView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";

export default class EmpresaDetalle extends Controller {

    public empresaService: EmpresaService;

    constructor(options: any) {
        super(options)
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            router: this.router,
            api: this.api,
            App: this.App
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

        const layout = new LayoutView();
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

        layout.getRegion('subheader').show(navView);

        // Configurar vista principal
        const detalleView = new EmpresaDetalleView({ model: model });
        layout.getRegion('body').show(detalleView);

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
