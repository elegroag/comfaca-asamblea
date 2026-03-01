import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import HabilesListarView from "@/componentes/habiles/views/HabilesListarView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";
import { cacheCollection, getCachedCollection } from "@/componentes/CacheManager";
import HabilesCollection from "@/componentes/habiles/collections/HabilesCollection";


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

    }

    initialize(): void {
        // Los métodos __setEmpresas y __addEmpresas fueron eliminados del service
        // El controller principal ahora maneja las collections directamente
    }

    /**
     * Mostrar lista de habiles
     */
    listarHabiles(): void {
        this.initialize();
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
            router: this.router as any,
            api: this.api,
            app: this.app
        });

        const subheaderRegion = layout.getRegion('subheader');
        if (subheaderRegion) {
            subheaderRegion.show(navView);
        }

        // Delegar exportaciones al service (por consistencia)
        this.listenTo(navView, 'export:lista', this.empresaService.__exportLista);
        this.listenTo(navView, 'export:informe', this.empresaService.__exportInforme);

        const habiles = getCachedCollection('habiles', HabilesCollection);
        // Configurar vista principal
        const listView = new HabilesListarView({
            collection: habiles ?? [],
            router: this.router as any,
            api: this.api,
            app: this.app
        });

        this.listenTo(listView, 'remove:habiles', this.empresaService.__removeHabil);

        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(listView);
        }

        EmpresaNav.parentView = listView;
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
