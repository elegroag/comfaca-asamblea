import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaEditarView from "@/componentes/habiles/views/EmpresaEditarView";
import EmpresaService from "./EmpresaService";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var EmpresaNav: any;
}

interface EmpresaEditarOptions {
	region?: any;
	[key: string]: any;
}

export default class EmpresaEditar {
	public region: any;
	public layout: any;
	public empresaService: EmpresaService;

	constructor(options: EmpresaEditarOptions = {}) {
		this.layout = null;
		_.extend(this, Backbone.Events);
		_.extend(this, options);

		if ($App && $App.Collections) {
			$App.Collections.empresas = null;
		}

		this.empresaService = new EmpresaService();

		if (typeof this.listenTo === 'function') {
			this.listenTo(this, 'set:empresas', this.empresaService.__setEmpresas);
			this.listenTo(this, 'add:empresa', this.empresaService.__addEmpresas);
		}
	}

	/**
	 * Mostrar vista de edición de empresa
	 */
	editaEmpresa(model: any): void {
		console.log('EmpresaEditar.editaEmpresa() called', model);

		this.layout = new LayoutView();
		this.region.show(this.layout);

		// Inicializar colección de empresas
		EmpresaService.initEmpresas();

		console.log('Habiles', model.toJSON());

		// Configurar vista principal
		const editarView = new EmpresaEditarView({ model: model });

		if (typeof this.listenTo === 'function') {
			this.listenTo(editarView, 'form:edit', this.empresaService.__saveEmpresa);
			this.listenTo(editarView, 'add:empresas', this.empresaService.__addEmpresas);
			this.listenTo(editarView, 'set:empresas', this.empresaService.__setEmpresas);
			this.listenTo(editarView, 'notify', this.empresaService.__notifyPlataforma);
		}

		this.layout.getRegion('body').show(editarView);

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
		});

		this.layout.getRegion('subheader').show(navView);
	}

	/**
	 * Destruir la vista
	 */
	destroy(): void {
		console.log('EmpresaEditar.destroy() called');

		if (this.region && typeof this.region.remove === 'function') {
			this.region.remove();
		}

		if (typeof this.stopListening === 'function') {
			this.stopListening();
		}
	}
}
