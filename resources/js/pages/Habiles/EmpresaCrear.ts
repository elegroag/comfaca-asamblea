import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaCrearView from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";
import { getCachedCollection } from "@/componentes/CacheManager";
import EmpresasCollection from "@/collections/EmpresasCollection";

export default class EmpresaCrear extends Controller {

    public empresaService: EmpresaService;

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

    /**
     * Mostrar vista de creación de empresa
     */
    crearEmpresa(): void {
        console.log('EmpresaCrear.crearEmpresa() called');

        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        const empresas = getCachedCollection('empresas', EmpresasCollection);

        // Configurar vista principal
        const crearView = new EmpresaCrearView({
            EmpresaModel: Empresa,
            collection: empresas ?? [], // La vista se actualizará cuando el controller cargue los datos
            api: this.api,
            app: this.app,
            router: this.router as any
        });


        this.listenTo(crearView, 'form:save', this.empresaService.__saveEmpresa);
        this.listenTo(crearView, 'notify', this.empresaService.__notifyPlataforma);


        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(crearView);
        }

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
            app: this.app,
            router: this.router as any
        });

        const subheaderRegion = layout.getRegion('subheader');
        if (subheaderRegion) {
            subheaderRegion.show(navView);
        }
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
