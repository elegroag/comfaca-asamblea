import LayoutView from "@/componentes/habiles/views/LayoutView";
import EmpresaNav from "@/componentes/habiles/views/EmpresaNav";
import EmpresaCrearView from "@/componentes/habiles/views/EmpresaCrearView";
import EmpresaService from "./EmpresaService";

declare global {
	var $: any;
	var _: any;
	var $App: any;
	var EmpresaNav: any;
}

interface EmpresaCrearOptions {
	region?: any;
	[key: string]: any;
}

export default class EmpresaCrear {
	public region: any;
	public layout: any;
	public empresaService: EmpresaService;

	constructor(options: EmpresaCrearOptions = {}) {
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
	 * Mostrar vista de creación de empresa
	 */
	crearEmpresa(): void {
		console.log('EmpresaCrear.crearEmpresa() called');

		this.layout = new LayoutView();
		this.region.show(this.layout);

		// Inicializar colección de empresas
		EmpresaService.initEmpresas();

		// Cargar datos si la colección está vacía
		if (!$App.Collections.empresas || !_.size($App.Collections.empresas) || _.size($App.Collections.empresas) === 0) {
			this.empresaService.__findAll();
		}

		// Configurar vista principal
		const crearView = new EmpresaCrearView({
			collection: $App.Collections.empresas,
		});

		if (typeof this.listenTo === 'function') {
			this.listenTo(crearView, 'form:save', this.empresaService.__saveEmpresa);
			this.listenTo(crearView, 'add:empresas', this.empresaService.__addEmpresas);
			this.listenTo(crearView, 'set:empresas', this.empresaService.__setEmpresas);
			this.listenTo(crearView, 'notify', this.empresaService.__notifyPlataforma);
		}

		this.layout.getRegion('body').show(crearView);

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
		});

		this.layout.getRegion('subheader').show(navView);
	}

	/**
	 * Destruir la vista
	 */
	destroy(): void {
		console.log('EmpresaCrear.destroy() called');

		if (this.region && typeof this.region.remove === 'function') {
			this.region.remove();
		}

		if (typeof this.stopListening === 'function') {
			this.stopListening();
		}
	}
}
