import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaListarView from "@/componentes/habiles/views/EmpresaListarView";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var EmpresaService: any;
	var EmpresaNav: any;
}

interface EmpresasListarOptions {
	region?: any;
	[key: string]: any;
}

export default class EmpresasListar {
	public region: any;
	public layout: any;
	public empresaService: any;

	constructor(options: EmpresasListarOptions = {}) {
		this.layout = null;
		_.extend(this, Backbone.Events);
		_.extend(this, options);

		this.empresaService = new EmpresaService();
		if (typeof this.listenTo === 'function') {
			this.listenTo(this, 'set:empresas', this.empresaService.__setEmpresas);
			this.listenTo(this, 'add:empresa', this.empresaService.__addEmpresas);
		}
	}

	/**
	 * Mostrar lista de empresas
	 */
	listaEmpresas(): void {
		console.log('EmpresasListar.listaEmpresas() called');

		this.layout = new LayoutView();
		this.region.show(this.layout);

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
		});

		this.layout.getRegion('subheader').show(navView);

		// Configurar vista principal
		const listView = new EmpresaListarView({
			collection: $App.Collections.empresas,
		});

		if (typeof this.listenTo === 'function') {
			this.listenTo(listView, 'remove:empresa', this.empresaService.__removeEmpresa);
		}

		this.layout.getRegion('body').show(listView);

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
