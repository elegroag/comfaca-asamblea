import LayoutView from "@/componentes/layouts/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaEditarView from "@/componentes/habiles/views/EmpresaEditarView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";
import Empresa from "@/models/Empresa";

export default class EmpresaEditar extends Controller {
    public empresaService: EmpresaService;

    constructor(options: any) {
        super(options)
        this.region = options.region;
        _.extend(this, options);

        this.empresaService = new EmpresaService({
            api: this.api,
            app: this.app,
            logger: this.logger,
            EmpresaModel: Empresa
        });

        // Los métodos __setEmpresas y __addEmpresas fueron eliminados del service
        // El controller principal ahora maneja las collections directamente
    }

    /**
     * Mostrar vista de edición de empresa
     */
    editaEmpresa(model: any): void {
        console.log('EmpresaEditar.editaEmpresa() called', model);

        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        // La colección se maneja en el controller principal

        console.log('Habiles', model.toJSON());

        // Configurar vista principal
        const editarView = new EmpresaEditarView({
            model: model,
            router: this.router,
            api: this.api,
            app: this.app,
            EmpresaModel: Empresa
        });


        this.listenTo(editarView, 'form:edit', this.empresaService.__saveEmpresa);
        this.listenTo(editarView, 'notify', this.empresaService.__notifyPlataforma);


        const bodyRegion = layout.getRegion('body');
        if (bodyRegion) {
            bodyRegion.show(editarView);
        }

        // Establecer parent view para navegación
        if (EmpresaNav) {
            EmpresaNav.parentView = editarView;
        }

        // Configurar navegación
        const navView = new EmpresaNav({
            model: {
                titulo: 'Editar empresa',
                listar: true,
                exportar: false,
                crear: true,
                editar: false,
                masivo: true,
            },
            api: this.api,
            app: this.app,
            router: this.router
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
        console.log('EmpresaEditar.destroy() called');
        this.region.remove();
        this.stopListening();
    }
}
