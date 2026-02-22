import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import HabilesListarView from "@/componentes/habiles/views/HabilesListarView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";


export default class EmpresasHabiles extends Controller {

    public empresaService: any;

    constructor(options: any) {
        super(options)
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            api: this.api,
            app: this.app,
            logger: this.logger,
            EmpresaModel: Empresa
        });

        this.listenTo(this, 'set:habiles', this.empresaService.__setHabiles);
        this.listenTo(this, 'add:habiles', this.empresaService.__addHabiles);

    }

    /**
     * Mostrar lista de habiles
     */
    listarHabiles(): void {
        console.log('EmpresasHabiles.listarHabiles() called');

        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        // Configurar navegación
        const navView = new EmpresaNav({
            model: {
                titulo: 'Empresas habiles',
                listar: false,
                exportar: false,
                crear: false,
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

        // Delegar exportaciones al service (por consistencia)
        this.listenTo(navView, 'export:lista', this.empresaService.__exportLista);
        this.listenTo(navView, 'export:informe', this.empresaService.__exportInforme);

        // Configurar vista principal
        const listView = new HabilesListarView({
            collection: this.empresaService.Collections.habiles,
            router: this.router as any,
            api: this.api,
            App: this.App
        });

        this.listenTo(listView, 'remove:habiles', this.empresaService.__removeHabil);

        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(listView);
        }
    }

    /**
     * Destruir la vista
     */
    destroy(): void {
        console.log('EmpresasHabiles.destroy() called');
        this.region.remove();
        this.stopListening();
    }
}
