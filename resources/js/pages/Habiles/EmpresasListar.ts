import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaListarView from "@/componentes/habiles/views/EmpresaListarView";
import { Controller } from "@/common/Controller";
import EmpresaService from "./EmpresaService";
import Empresa from "@/models/Empresa";
import { getCachedCollection } from "@/componentes/CacheManager";
import EmpresasCollection from "@/collections/EmpresasCollection";

export default class EmpresasListar extends Controller {
    public empresaService: any;

    constructor(options: any) {
        super(options);
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            api: this.api,
            app: this.app,
            logger: this.logger,
            EmpresaModel: Empresa
        });
    }

    /**
     * Manejar eliminación de empresa
     */
    handleRemoveEmpresa(transfer: any): void {
        this.empresaService.__removeEmpresa(transfer);
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
            app: this.app,
            router: this.router as any
        });

        const subheaderRegion = layout.getRegion('subheader');
        if (subheaderRegion) {
            subheaderRegion.show(navView);
        }
        // Delegar exportaciones al service
        this.listenTo(navView, 'export:lista', this.empresaService.__exportLista);
        this.listenTo(navView, 'export:informe', this.empresaService.__exportInforme);

        const empresas = getCachedCollection('empresas', EmpresasCollection);

        // Configurar vista principal
        const listView = new EmpresaListarView({
            collection: empresas ?? [], // La vista se actualizará cuando el controller cargue los datos
            router: this.router as any,
            api: this.api,
            app: this.app
        });

        if (typeof this.listenTo === 'function') {
            this.listenTo(listView, 'remove:empresa', this.handleRemoveEmpresa.bind(this));
        }

        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(listView);
        }

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
