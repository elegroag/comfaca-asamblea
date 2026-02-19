import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import HabilesListarView from "@/componentes/habiles/views/HabilesListarView";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var EmpresaService: any;
	var EmpresaNav: any;
}

interface EmpresasHabilesOptions {
	region?: any;
	[key: string]: any;
}

export default class EmpresasHabiles {
	public region: any;
	public layout: any;
	public empresaService: any;

	constructor(options: EmpresasHabilesOptions = {}) {
		this.layout = null;
		_.extend(this, Backbone.Events);
		_.extend(this, options);

		this.empresaService = new EmpresaService();

		if (typeof this.listenTo === 'function') {
			this.listenTo(this, 'set:habiles', this.empresaService.__setHabiles);
			this.listenTo(this, 'add:habiles', this.empresaService.__addHabiles);
		}
	}

	/**
	 * Mostrar lista de habiles
	 */
	listarHabiles(): void {
		console.log('EmpresasHabiles.listarHabiles() called');

		this.layout = new LayoutView();
		this.region.show(this.layout);

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
		});

		this.layout.getRegion('subheader').show(navView);

		// Configurar vista principal
		const listView = new HabilesListarView({
			collection: $App.Collections.habiles,
		});

		if (typeof this.listenTo === 'function') {
			this.listenTo(listView, 'remove:habiles', this.empresaService.__removeHabil);
		}

		this.layout.getRegion('body').show(listView);
	}

	/**
	 * Destruir la vista
	 */
	destroy(): void {
		console.log('EmpresasHabiles.destroy() called');

		if (this.region && typeof this.region.remove === 'function') {
			this.region.remove();
		}

		if (typeof this.stopListening === 'function') {
			this.stopListening();
		}
	}
}
