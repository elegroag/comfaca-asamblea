import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaListarView from "@/componentes/habiles/views/EmpresaListarView";
import { Controller } from "@/common/Controller";
import EmpresaService from "./EmpresaService";

export default class EmpresasListar extends Controller {
    public empresaService: any;

    constructor(options: any) {
        super(options);
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
     * Mostrar lista de empresas
     */
    listaEmpresas(): void {
        console.log('EmpresasListar.listaEmpresas() called');

        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        // Configurar navegación
        const navView = new EmpresaNav({
            model: {
                titulo: 'Lista de empresas',
                listar: false,
                exportar: true,
                crear: true,
                editar: false,
                masivo: true,
            },
            api: this.api,
            App: this.App,
            router: this.router
        });

        layout.getRegion('subheader').show(navView);

        // Configurar vista principal
        const listView = new EmpresaListarView({
            collection: this.empresaService.Collections.empresas || [],
            router: this.router,
            api: this.api,
            App: this.App
        });

        if (typeof this.listenTo === 'function') {
            this.listenTo(listView, 'remove:empresa', this.empresaService.__removeEmpresa);
        }

        layout.getRegion('body').show(listView);

        // Establecer parent view para navegación
        if (EmpresaNav) {
            EmpresaNav.parentView = listView;
        }
    }

    /**
     * Destruir la vista
     */
    destroy(): void {
        console.log('EmpresasListar.destroy() called');

        if (this.region && typeof this.region.remove === 'function') {
            this.region.remove();
        }

        if (typeof this.stopListening === 'function') {
            this.stopListening();
        }
    }
}
