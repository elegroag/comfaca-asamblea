import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaEditarView from "@/componentes/habiles/views/EmpresaEditarView";
import EmpresaService from "./EmpresaService";
import { Controller } from "@/common/Controller";

export default class EmpresaEditar extends Controller {
    public empresaService: EmpresaService;

    constructor(options: any) {
        super(options)
        this.region = options.region;
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
     * Mostrar vista de edición de empresa
     */
    editaEmpresa(model: any): void {
        console.log('EmpresaEditar.editaEmpresa() called', model);

        const layout: LayoutView = new LayoutView();
        this.region.show(layout);

        // Inicializar colección de empresas
        this.empresaService.initEmpresas();

        console.log('Habiles', model.toJSON());

        // Configurar vista principal
        const editarView = new EmpresaEditarView({
            model: model,
            router: this.router,
            api: this.api,
            App: this.App
        });


        this.listenTo(editarView, 'form:edit', this.empresaService.__saveEmpresa);
        this.listenTo(editarView, 'add:empresas', this.empresaService.__addEmpresas);
        this.listenTo(editarView, 'set:empresas', this.empresaService.__setEmpresas);
        this.listenTo(editarView, 'notify', this.empresaService.__notifyPlataforma);


        layout.getRegion('body').show(editarView);

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
            App: this.App,
            router: this.router
        });

        layout.getRegion('subheader').show(navView);
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
