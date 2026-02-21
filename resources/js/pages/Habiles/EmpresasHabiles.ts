import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import HabilesListarView from "@/componentes/habiles/views/HabilesListarView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";


export default class EmpresasHabiles extends Controller {

    public empresaService: any;

    constructor(options: any) {
        super(options)
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            router: this.router,
            api: this.api,
            App: this.App
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

        layout.getRegion('subheader').show(navView);

        // Configurar vista principal
        const listView = new HabilesListarView({
            collection: this.empresaService.Collections.habiles,
            router: this.router,
            api: this.api,
            App: this.App
        });

        this.listenTo(listView, 'remove:habiles', this.empresaService.__removeHabil);

        layout.getRegion('body').show(listView);
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
