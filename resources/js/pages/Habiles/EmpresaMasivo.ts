import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaMasivoView from "@/componentes/habiles/views/EmpresaMasivoView";
import EmpresaService from "./EmpresaService";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var EmpresaNav: any;
}

interface EmpresaMasivoOptions {
	region?: any;
	[key: string]: any;
}

export default class EmpresaMasivo {
	public region: any;
	public layout: any;
	public empresaService: EmpresaService;

	constructor(options: EmpresaMasivoOptions = {}) {
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
	 * Mostrar vista de cargue masivo
	 */
	cargueMasivo(): void {
		console.log('EmpresaMasivo.cargueMasivo() called');

		this.layout = new LayoutView();
		this.region.show(this.layout);

		// Inicializar colección de empresas
		EmpresaService.initEmpresas();

		// Cargar datos si la colección está vacía
		if (!$App.Collections.empresas || !_.size($App.Collections.empresas) || _.size($App.Collections.empresas) === 0) {
			this.empresaService.__findAll();
		}

		// Configurar vista principal
		const masivoView = new EmpresaMasivoView({
			collection: $App.Collections.empresas,
		});

		if (typeof this.listenTo === 'function') {
			this.listenTo(masivoView, 'form:save', this.empresaService.__saveEmpresa);
		}

		this.layout.getRegion('body').show(masivoView);

		// Establecer parent view para navegación
		if (EmpresaNav) {
			EmpresaNav.parentView = masivoView;
		}

		// Configurar navegación
		const navView = new EmpresaNav({
			model: {
				titulo: 'Cargue masivo empresa',
				listar: true,
				exportar: false,
				crear: true,
				editar: false,
				masivo: false,
			},
		});

		this.layout.getRegion('subheader').show(navView);
	}

	/**
	 * Destruir la vista
	 */
	destroy(): void {
		console.log('EmpresaMasivo.destroy() called');

		if (this.region && typeof this.region.remove === 'function') {
			this.region.remove();
		}

		if (typeof this.stopListening === 'function') {
			this.stopListening();
		}
	}
}
